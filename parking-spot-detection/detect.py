import cv2
import pickle
import numpy as np
import requests


url = "http://localhost:8080/ia/update"


cap = cv2.VideoCapture("../data/Parking.mp4")


with open("slots.pkl", "rb") as f:
    slots = pickle.load(f)


bg_frames = []

for _ in range(30):
    ret, frame = cap.read()
    if not ret:
        break
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    bg_frames.append(gray)

bg_gray = np.median(bg_frames, axis=0).astype(np.uint8)

cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

kernel = np.ones((3, 3), np.uint8)


last_state = {}

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    diff = cv2.absdiff(gray, bg_gray)
    diff = cv2.GaussianBlur(diff, (5, 5), 0)

    _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)

    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    free = 0
    occupied = 0

    for i, slot in enumerate(slots):
        x1, y1, x2, y2 = slot

        roi = thresh[y1:y2, x1:x2]

        if roi.size == 0:
            continue

        score = cv2.countNonZero(roi)
        ratio = score / roi.size

        h, w = roi.shape
        center = roi[int(h * 0.25):int(h * 0.75), int(w * 0.25):int(w * 0.75)]
        center_ratio = cv2.countNonZero(center) / center.size

        is_occupied = (ratio > 0.40) or (center_ratio > 0.30)

        
        color = (0, 0, 255) if is_occupied else (0, 255, 0)

       
        if is_occupied:
            occupied += 1
        else:
            free += 1

        
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        
        numero = f"P{i+1}"
        cv2.putText(frame, numero,
                    (x1 + 3, y1 + 15),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 255, 255),
                    1,
                    cv2.LINE_AA)

        
        current_state = "OCCUPE" if is_occupied else "LIBRE"

       
        if last_state.get(i) != current_state:
            try:
                requests.post(url, json={
                    "numero": numero,
                    "status": current_state
                })
                last_state[i] = current_state
            except Exception as e:
                print("Erreur API:", e)

    total = len(slots)

   
    cv2.rectangle(frame, (20, 15), (420, 65), (255, 255, 255), -1)

    cv2.putText(frame,
                f"Free: {free} | Occupied: {occupied} | Total: {total}",
                (30, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 0, 0),
                2)

    cv2.imshow("SMART PARKING SYSTEM", frame)

    if cv2.waitKey(30) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()