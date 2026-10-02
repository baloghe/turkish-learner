import re

from music21 import stream, note, duration, spanner


DEFAULT_DURATION = 1.0
APPOGGIATURA_MAX = 1 / 16  # 0.0625


def parse_note_token(token: str):
    """
    Convierte:
        C4      -> ("C4", 1.0)
        D#41.5  -> ("D#4", 1.5)
        A40.5   -> ("A4", 0.5)
    """

    m = re.match(
        r'^([A-GH][#b]?\d+)(\d+(?:\.\d+)?)?$',
        token
    )

    if not m:
        raise ValueError(f"Nota inválida: {token}")

    pitch = m.group(1)
    dur = float(m.group(2)) if m.group(2) else DEFAULT_DURATION

    return pitch, dur


def create_note(token: str):
    pitch, dur = parse_note_token(token)
    return note.Note(pitch, quarterLength=dur)


def create_rest(token: str):
    dur_txt = token[1:]

    dur = (
        float(dur_txt)
        if dur_txt
        else DEFAULT_DURATION
    )

    return note.Rest(quarterLength=dur)


def apply_triplet(notes):
    tuplet = duration.Tuplet(3, 2)

    for n in notes:
        n.duration.appendTuplet(tuplet)

    return notes


def parse_slur(expr: str):
    """
    D#4-G4-C51.5
    """

    notes = [create_note(t) for t in expr.split('-')]

    sl = spanner.Slur(notes)

    return notes, sl


def parse_appoggiatura(expr: str):
    """
    Ejemplos:

        PH3-A4
        PH3-A40.0625
        PH5-A40.5-E40.5-C40.5
    """

    parts = expr[1:].split('-')

    support_pitch, _ = parse_note_token(parts[0])

    principal_pitch, principal_dur = parse_note_token(parts[1])

    if principal_dur > APPOGGIATURA_MAX:
        support_dur = APPOGGIATURA_MAX
    else:
        support_dur = principal_dur / 2

    principal_remaining = principal_dur - support_dur

    support = note.Note(
        support_pitch,
        quarterLength=support_dur
    )

    principal = note.Note(
        principal_pitch,
        quarterLength=principal_remaining
    )

    notes = [support, principal]

    for p in parts[2:]:
        notes.append(create_note(p))

    sl = spanner.Slur(notes)

    return notes, sl


def split_top_level(text: str):
    """
    Divide por espacios pero respetando T(...)

    Ejemplo:
        C4 T(A4 C4) R

    ->
        ['C4', 'T(A4 C4)', 'R']
    """

    result = []
    depth = 0
    current = []

    for ch in text:
        if ch == '(':
            depth += 1
            current.append(ch)

        elif ch == ')':
            depth -= 1
            current.append(ch)

        elif ch == ' ' and depth == 0:
            if current:
                result.append(''.join(current))
                current = []

        else:
            current.append(ch)

    if current:
        result.append(''.join(current))

    return result


def parse_triplet(token: str):
    """
    T(A40.5 A40.5 A40.5)

    T(A40.5 C4)

    T(A40.5-C50.5 E50.5)
    """

    inner = token[2:-1]

    substream = stream.Stream()

    parse_sequence(inner, substream)

    notes = list(substream.notes)

    apply_triplet(notes)

    return substream


def parse_sequence(text: str, melody: stream.Stream):

    for token in split_top_level(text):

        # -------------------------
        # TRIPLETE
        # -------------------------

        if token.startswith('T('):

            triplet_stream = parse_triplet(token)

            for el in triplet_stream:
                melody.append(el)

        # -------------------------
        # APPOGGIATURA
        # -------------------------

        elif token.startswith('P'):

            notes, sl = parse_appoggiatura(token)

            for n in notes:
                melody.append(n)

            melody.insert(0, sl)

        # -------------------------
        # REST
        # -------------------------

        elif token.startswith('R'):

            melody.append(create_rest(token))

        # -------------------------
        # SLUR
        # -------------------------

        elif '-' in token:

            notes, sl = parse_slur(token)

            for n in notes:
                melody.append(n)

            melody.insert(0, sl)

        # -------------------------
        # NOTE
        # -------------------------

        else:

            melody.append(create_note(token))


def lector(texto: str) -> stream.Stream:
    """
    Lector principal.
    """

    melody = stream.Stream()

    parse_sequence(texto, melody)

    return melody

if __name__ == "__main__":
    m = lector("C4 D4 E4")
    m.show()
