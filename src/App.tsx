import React, {useEffect, useRef, useState} from 'react';
import "./App.scss";

/*
 */

type TimeArray = [number, number, number, number, number, number];
type TimerState = "edit" | "running" | "paused" | "elapsed";

function hmsToTime(hours: number, minutes: number, seconds: number): TimeArray {
    return [
        Math.floor(hours / 10),
        hours % 10,
        Math.floor(minutes / 10),
        minutes % 10,
        Math.floor (seconds / 10),
        seconds % 10,
    ];
}

function normalizeTime(time: TimeArray): TimeArray | null {
    let seconds = parseInt(`${time[4]}${time[5]}`);
    let minutes = parseInt(`${time[2]}${time[3]}`);
    let hours = parseInt(`${time[0]}${time[1]}`);

    if (seconds >= 60) {
        minutes += Math.floor(seconds / 60);
        seconds = seconds % 60;
    }

    if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
    }

    if (hours >= 100) {
        alert("This time is too large! Please enter a smaller time");
        return null;
    }

    return hmsToTime(hours, minutes, seconds);
}

function secondsToTime(totalSeconds: number): TimeArray {
    let rest = totalSeconds;
    let seconds = rest % 60;

    rest = Math.floor(rest / 60);
    let minutes = rest % 60;

    rest = Math.floor(rest / 60);
    let hours = Math.min(rest, 99);

    return hmsToTime(hours, minutes, seconds);
}

function timeToSeconds(time: TimeArray): number {
    let seconds = parseInt(`${time[4]}${time[5]}`);
    let minutes = parseInt(`${time[2]}${time[3]}`);
    let hours = parseInt(`${time[0]}${time[1]}`);

    return seconds + minutes * 60 + hours * 60 * 60;
}

function timeToString(time: TimeArray): string {
    return `${time[0]}${time[1]}h ${time[2]}${time[3]}m ${time[4]}${time[5]}s`;
}

function secondsToString(totalSeconds: number): string {
    let rest = totalSeconds;
    let seconds = String(rest % 60).padStart(2, '0');

    rest = Math.floor(rest / 60);
    let minutes = String(rest % 60).padStart(2, '0');

    rest = Math.floor(rest / 60);
    let hours = String(Math.min(rest, 99)).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function App() {
    return (
        <div className="app">
            <Timer />
        </div>
    );
}

function Timer() {
    const [timerState, setTimerState] = useState<TimerState>("edit");
    const [remainingTime, setRemainingTime] = useState<number>(0);  // In seconds
    const [time, setTime] = useState<TimeArray>([0, 0, 0, 0, 0, 0]);
    const alarm = useRef<HTMLAudioElement>(null);

    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    useEffect(() => {
        if (timerState !== "running") return;

        if (remainingTime > 0) {
            document.title = secondsToString(remainingTime);

            const newRemainingTime = Math.max(0, remainingTime - 1);
            const timer = setTimeout(
                () => setRemainingTime(newRemainingTime),
                1000
            );

            return () => clearTimeout(timer);
        } else if (remainingTime === 0) {
            alarm.current?.play();
            document.title = "Done";
            setTimerState("elapsed");
        }
    }, [timerState, remainingTime]);


    const handleStart = () => {
        const newTime = normalizeTime(time);
        if (newTime) {
            setTime(newTime);

            const newRemainingTime = timeToSeconds(newTime);
            setRemainingTime(newRemainingTime);
            document.title = secondsToString(newRemainingTime);

            setTimerState("running");
        }
    }

    const handleKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (digits.includes(event.key)) {
            const newTime: TimeArray = [time[1], time[2], time[3], time[4], time[5], parseInt(event.key)];
            setTime(newTime);
        } else if (event.key === "Enter") {
            handleStart();
        } else if (event.key === "Delete" || event.key === "Backspace") {
            const newTime: TimeArray = [0, time[0], time[1], time[2], time[3], time[4]];
            setTime(newTime);
        }
    };

    const stopAlarm = () => {
        if (alarm.current) {
            alarm.current.pause();
            alarm.current.currentTime = 0;
        }
    }

    const handleClear = () => {
        setTime([0, 0, 0, 0, 0, 0]);
        setRemainingTime(0);
    };

    const handleStop = () => {
        stopAlarm();
        setTimerState("edit");
        document.title = "JavaScript Timer";
        setRemainingTime(timeToSeconds(time));
    };

    const displayTime = timerState === "edit" ? time : secondsToTime(remainingTime);

    return (
        <div className="timer-container">
            <audio src="./alarm.mp3" ref={alarm} loop></audio>
            <div
                className="timer-text"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (timerState === "edit") {
                        handleKey(event);
                    }
                }}
            >
                {timeToString(displayTime)}
            </div>
            <div className="timer-buttons">
                {timerState === "edit" && <button onClick={handleClear}>Clear</button>}
                {timerState === "edit" && <button onClick={handleStart}>Start</button>}
                {(timerState === "running"|| timerState === "paused") && <button onClick={handleStop}>Reset</button>}
                {timerState === "running" && <button onClick={() => setTimerState("paused")}>Pause</button>}
                {timerState === "paused" && <button onClick={() => setTimerState("running")}>Resume</button>}
                {timerState === "elapsed" && <button onClick={handleStop}>Done</button>}
            </div>
        </div>
    );
}

export default App;
