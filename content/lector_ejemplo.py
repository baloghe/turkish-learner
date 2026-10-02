from lector import lector

outfile="melodia2.mid"
str="C4 D#4-G4-C51.5 R1.5 PB4-A40.5 R PB5-A4 C4 T(A40.5 A40.5 A40.5) T(A40.5 C4)"

melody = lector(str).write("midi", fp=outfile)

print(f"Archivo MIDI generado: {outfile}")
# ToDo
