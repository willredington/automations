import { DateTime } from "luxon";

export function parseLocalTimeToUtcTime({
  timeValue,
  timeZone,
}: {
  timeValue:
    | string
    | {
        hours: number;
        minutes: number;
      };
  timeZone: string;
}): {
  hours: number;
  minutes: number;
} {
  let hours = 0;
  let minutes = 0;

  if (typeof timeValue === "string") {
    // Split the time string by `:`
    const [hoursStr, minutesStr] = timeValue.split(":");

    // Ensure valid format from the database (or input)
    if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeValue)) {
      throw new Error("Invalid time format. Expected HH:MM or HH:MM:SS.");
    }

    hours = parseInt(hoursStr, 10);
    minutes = parseInt(minutesStr, 10);
  } else {
    // <<< ADD THIS ELSE BLOCK
    hours = timeValue.hours;
    minutes = timeValue.minutes;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(
      "Invalid time values. Hours must be 0-23 and minutes 0-59."
    );
  }

  // Create a DateTime object with today's date and the specified time in the user's timezone
  const localDateTime = DateTime.now().setZone(timeZone).set({
    hour: hours,
    minute: minutes,
    second: 0,
    millisecond: 0,
  });

  // Convert to UTC
  const utcDateTime = localDateTime.toUTC();

  // Return the UTC hours and minutes
  return {
    hours: utcDateTime.hour,
    minutes: utcDateTime.minute,
  };
}

export function extractTimeFromString(timeString: string): {
  hours: number;
  minutes: number;
} {
  // Ensure valid format (HH:MM or HH:MM:SS)
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
    throw new Error("Invalid time format. Expected HH:MM or HH:MM:SS.");
  }

  const [hoursStr, minutesStr] = timeString.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (hours < 0 || hours > 23) {
    throw new Error("Invalid hours value. Must be between 0 and 23.");
  }

  if (minutes < 0 || minutes > 59) {
    throw new Error("Invalid minutes value. Must be between 0 and 59.");
  }

  return { hours, minutes };
}
