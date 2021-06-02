import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
// @ts-ignore
import styles from "../styles/Home.module.css";

export default function ExactPage() {
  const [currentDeviceInfoIndex, setCurrentDeviceInfosIndex] = useState(-1);
  const [deviceInfos, setDeviceInfos] = useState<MediaDeviceInfo[]>([]);
  const [deviceInfosError, setDeviceInfosError] = useState<{
    message?: any;
    name?: any;
  }>({});
  const [msg, setMsg] = useState("");

  const handleError = (error) => {
    setDeviceInfosError({
      message: error.message,
      name: error.name,
    });
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((deInfo) => {
      console.log("deInfo", deInfo);
    });
    // To trigger Ask Permission Dialog
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then((stream) => {
        // We haven't use MediaStream yet. Stop all tracks first.
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());

        navigator.mediaDevices
          .enumerateDevices()
          .then((deviceInfos) => {
            const videoDeviceInfos = deviceInfos.filter(
              (deviceInfo) => deviceInfo.kind === "videoinput"
            );
            console.log("videoDeviceInfos", videoDeviceInfos);
            setDeviceInfos(videoDeviceInfos);
            const idx =
              videoDeviceInfos.length > 0 ? videoDeviceInfos.length - 1 : -1;
            setCurrentDeviceInfosIndex(idx);
            // // iOS returns deviceInfo with all empty string if Permission not granted
            // const isPermissionGranted = videoDeviceInfos.every((deviceInfo) =>
            //   Boolean(deviceInfo.deviceId)
            // );
            // if (isPermissionGranted) {
            //   setDeviceInfos(videoDeviceInfos);
            // } else {
            //   alert("permisson not granted");
            // }
          })
          .catch(handleError);
      })
      .catch((err) => {
        alert("You blocked Camera Permission.");
      });
  }, []);

  useEffect(() => {
    if (deviceInfos.length > 0 && currentDeviceInfoIndex > -1) {
      setMsg(JSON.stringify(deviceInfos[currentDeviceInfoIndex]));
      clearMediaStream();

      const constraints = {
        audio: false,
        video: {
          deviceId: deviceInfos[currentDeviceInfoIndex].deviceId
            ? {
                exact: deviceInfos[currentDeviceInfoIndex].deviceId,
              }
            : undefined,
        },
      };

      console.log("switch camera: constraints", constraints);
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream: MediaStream) => {
          console.log("switch camera: MediaStream", stream);
          // @ts-ignore
          window.stm = stream;

          const videoElement = document.getElementById(
            "qr-video"
          ) as HTMLVideoElement;
          if ("srcObject" in videoElement) {
            // @ts-ignore
            videoElement.srcObject = window.stm;
          } else {
            // @ts-ignore
            videoElement.src = window.URL.createObjectURL(window.stm);
          }
          videoElement.onloadedmetadata = function (e) {
            videoElement.play();
          };
        })
        .catch(handleError);
    }
  }, [deviceInfos, currentDeviceInfoIndex]);

  const clearMediaStream = () => {
    // @ts-ignore
    const stream = window.stm;

    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      // @ts-ignore
      window.stm = null;
    }
  };

  const handleSwitchCamera = useCallback(() => {
    console.log("deviceInfos", deviceInfos);
    console.log("currentDeviceInfoIndex", currentDeviceInfoIndex);

    const nextDeviceIndex =
      currentDeviceInfoIndex <= 0
        ? deviceInfos.length - 1
        : currentDeviceInfoIndex - 1;
    console.log("nextDeviceIndex", nextDeviceIndex);

    clearMediaStream();
    setCurrentDeviceInfosIndex(nextDeviceIndex);
  }, [deviceInfos, currentDeviceInfoIndex]);

  return (
    <>
      <Head>
        <title>Exact Device | Camera Test Page</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.heading}>Camera Test</h1>

        <div className={styles.fieldsetContainer}>
          <fieldset>
            <legend>Exact Device:</legend>
            <button
              onClick={() => {
                handleSwitchCamera();
              }}
              className={styles.button}
            >
              Switch
            </button>
            <button
              onClick={() => {
                setMsg("");
                clearMediaStream();
              }}
              className={styles.button}
            >
              Clear
            </button>
          </fieldset>
        </div>

        <div className={styles.fieldsetContainer}>
          <fieldset>
            <legend>Message:</legend>
            <span style={{ minHeight: "1rem", wordBreak: "break-all" }}>
              {msg}
            </span>
          </fieldset>
        </div>

        <div id="qr-video-container">
          <video
            id="qr-video"
            muted
            autoPlay
            playsInline
            className={styles.video}
          />
        </div>
      </div>
    </>
  );
}
