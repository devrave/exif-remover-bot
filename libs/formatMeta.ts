import * as gm from "gm";

export function formatMeta(meta: gm.ImageInfo) {
  const lines: string[] = [];
  const exif = meta["Profile-EXIF"];

  lines.push(`Format: ${meta.Format}`);
  lines.push(`Size: ${meta.Geometry}`);
  lines.push(`File size: ${meta.Filesize}`);

  if (!exif) {
    return lines.join("\n");
  }

  const {
    Make: make,
    Model: model,
    "Date Time": datetime,
    Software: software,
    "GPS Date Stamp": gpsDateStamp,
    "GPS Latitude": gpsLatitude,
    "GPS Latitude Ref": gpsLatitudeRef,
    "GPS Longitude": gpsLongitude,
    "GPS Longitude Ref": gpsLongitudeRef,
    "Exif Version": exifVersion
  } = exif;

  if (datetime) {
    lines.push(`Date Time: ${datetime}`);
  }

  if (make || model) {
    lines.push(`Device: ${make} ${model}`);
  }

  if (software) {
    lines.push(`Software: ${software}`);
  }

  if (exifVersion) {
    lines.push(`EXIF Version: ${exifVersion}`);
  }

  if (gpsDateStamp) {
    lines.push(`GPS Date Stamp: ${gpsDateStamp}`);
  }

  if (gpsLatitude) {
    lines.push(`GPS Latitude: ${gpsLatitude} ${gpsLatitudeRef}`);
  }

  if (gpsLongitude) {
    lines.push(`GPS Longitude: ${gpsLongitude} ${gpsLongitudeRef}`);
  }

  return lines.join("\n");
}
