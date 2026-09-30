import cv2
import pickle

cap = cv2.VideoCapture("../data/parking.mp4")
ret, frame = cap.read()

slots = []
points = []

def mouse(event, x, y, flags, param):
    global points, slots

    if event == cv2.EVENT_LBUTTONDOWN:
        points.append((x, y))

        if len(points) == 2:
            (x1, y1), (x2, y2) = points

            x1, x2 = min(x1, x2), max(x1, x2)
            y1, y2 = min(y1, y2), max(y1, y2)

            slots.append((x1, y1, x2, y2))
            points = []

while True:
    temp = frame.copy()

   
    for (x1, y1, x2, y2) in slots:
        cv2.rectangle(temp, (x1,y1), (x2,y2), (0,255,255), 2)  # jaune


    for p in points:
        cv2.circle(temp, p, 5, (255,0,0), -1)  # bleu

    cv2.imshow("Slots", temp)
    cv2.setMouseCallback("Slots", mouse)

    key = cv2.waitKey(1)

    if key == ord('s'):
        with open("slots.pkl", "wb") as f:
            pickle.dump(slots, f)
        print("Saved")

    if key == ord('q'):
        break

cv2.destroyAllWindows()