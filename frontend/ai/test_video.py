import cv2
import pickle

cap = cv2.VideoCapture("../data/parking.mp4")

with open("slots.pkl", "rb") as f:
    slots = pickle.load(f)

bg_frames = []
for i in range(30):
    ret, frame = cap.read()
    if not ret:
        break
    bg_frames.append(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY))

bg_gray = sum(bg_frames) / len(bg_frames)

cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

   
    diff = cv2.absdiff(gray.astype("uint8"), bg_gray.astype("uint8"))

    diff = cv2.GaussianBlur(diff, (5,5), 0)

    _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)

    free = 0

    for (x1, y1, x2, y2) in slots:

        roi = thresh[y1:y2, x1:x2]
        score = cv2.countNonZero(roi)

        
        occupied = score > 200

        color = (0,0,255) if occupied else (0,255,0)

        if not occupied:
            free += 1

        cv2.rectangle(frame, (x1,y1), (x2,y2), color, 2)

    cv2.putText(frame,
                f"Free: {free}/{len(slots)}",
                (30, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255,255,255),
                2)

    cv2.imshow("Parking", frame)

    if cv2.waitKey(30) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()