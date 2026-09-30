import pickle

with open("slots.pkl", "rb") as f:
    slots = pickle.load(f)

print("Slots :", slots)
print("Nombre :", len(slots))