import csv
import networkx as nx

# future grid
grid = []

# Read the fie
with open('./archipelago.txt', mode='r', encoding='utf-8') as archivo:
    cnt = 0
    for line in archivo:
        row = []
        for x in list(line.strip()):
            if x == "~":
                row.append(0)          # replace ~ with integer 0
            elif x.isdigit():
                row.append(int(x))     # convert numbers to integers
            else:
                row.append(x)          # keep other characters as strings
        grid.append(row)
    
# Check how many rows you actually have
print("Number of rows:", len(grid))

print(grid[5][7])
