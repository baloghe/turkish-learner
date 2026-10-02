from music21 import stream, note, tempo, instrument, spanner
import copy

# Crear una partitura
melody = stream.Stream()

# Añadir tempo y instrumente
melody.append(tempo.MetronomeMark(number=200))
melody.append(instrument.Clarinet())

def apoya(melodia, apoyatura, principal, apoy_dur, prin_orig_dur):
    a = note.Note(apoyatura, quarterLength=apoy_dur)                  # apoyatura
    p = note.Note(principal, quarterLength=prin_orig_dur - apoy_dur)  # nota principal
    liga = spanner.Slur([a, p])
    melody.append(a)
    melody.append(p)
    melody.insert(0, liga)

def transpone_melodia(melodia, semitonos):
    nueva = copy.deepcopy(melodia)

    for elem in nueva.recurse():
        if isinstance(elem, note.Note):
            elem.transpose(semitonos, inPlace=True)

    return nueva

# Melodia
#1-2
melody.append(note.Note("E5", quarterLength=1))
melody.append(note.Note("G5", quarterLength=1))
apoya(melody, "A5", "B5", 1.0/16.0, 2.0)
melody.append(note.Note("G5", quarterLength=2))
melody.append(note.Note("E5", quarterLength=1))
melody.append(note.Note("D5", quarterLength=3))
#3-4
melody.append(note.Note("D5", quarterLength=1))
melody.append(note.Note("F#5", quarterLength=1))
apoya(melody, "G5", "A5", 1.0/16.0, 2.0)
melody.append(note.Note("F#5", quarterLength=2))
melody.append(note.Note("G5", quarterLength=1))
melody.append(note.Note("E5", quarterLength=3))

motivo1 = [
    note.Note("E4", quarterLength=1.5),
        note.Note("B4", quarterLength=0.5),
        note.Rest(quarterLength=0.5),
        note.Note("B4", quarterLength=1),
        note.Note("B4", quarterLength=0.5),

        note.Note("A4", quarterLength=1.5),
        note.Note("F#4", quarterLength=0.5),
        note.Note("C5", quarterLength=1),
        note.Note("A4", quarterLength=0.5),

        note.Note("F#4", quarterLength=1.5),
        note.Note("A4", quarterLength=0.5),
        note.Rest(quarterLength=0.5),
        note.Note("B4", quarterLength=1),
        note.Note("A4", quarterLength=0.5),

        note.Note("G4", quarterLength=1.5),
        note.Note("E4", quarterLength=0.5),
        note.Note("B4", quarterLength=1),
        note.Note("G4", quarterLength=0.5)
]
for _ in range(2): # repetir 2 veces
    for n in motivo1:
        melody.append(copy.deepcopy(n))

melody_up = transpone_melodia(melody, 2)
for n in melody_up.recurse():
    melody.append(copy.deepcopy(n))

# Exportar a MIDI
melody.write("midi", fp="melodia.mid")

print("Archivo MIDI generado: melodia.mid")