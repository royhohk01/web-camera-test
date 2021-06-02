import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
// @ts-ignore
import styles from "../styles/Home.module.css";

const hardSwitch = (isBackCam = true) => {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    if (devices.filter((device) => device.kind === "videoinput").length > 1) {
      // call getUserMedia first for permission prompt on iOS
      const allowedStream = navigator.mediaDevices.getUserMedia({
        video: { facingMode: isBackCam ? "environment" : "user" },
      });

      allowedStream.then((stream) => {
        console.log(stream);
        // @ts-ignore
        window.sss = stream;

        const videoElement = document.getElementById(
          "qr-video"
        ) as HTMLVideoElement;
        if ("srcObject" in videoElement) {
          // @ts-ignore
          videoElement.srcObject = window.sss;
        } else {
          // @ts-ignore
          videoElement.src = window.URL.createObjectURL(window.sss);
          console.log("i am inside");
        }
        videoElement.onloadedmetadata = function (e) {
          videoElement.play();
        };
      });
    }
  });
};

const cleanup = () => {
  // @ts-ignore
  const stream = window.sss;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    // @ts-ignore
    window.sss = null;
  }
};

export default function Home() {
  const [currentDeviceInfoIndex, setCurrentDeviceInfosIndex] = useState(-1);
  const [shouldStart, setShouldStart] = useState(false);
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

  // https://webrtc.github.io/samples/src/content/devices/input-output/
  // useEffect(() => {
  //   console.log("navigator.mediaDevices", navigator.mediaDevices);
  //   console.log(
  //     "navigator.mediaDevices",
  //     navigator.mediaDevices.enumerateDevices()
  //   );
  //   navigator.mediaDevices
  //     .enumerateDevices()
  //     .then((deviceInfos) => {
  //       const videoDeviceInfos = deviceInfos.filter(
  //         (deviceInfo) => deviceInfo.kind === "videoinput"
  //       );
  //       setDeviceInfos(videoDeviceInfos);
  //     })
  //     .catch(handleError);
  // }, []);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((deInfo) => {
      console.log("deInfo", deInfo);
    });
    // To trigger Ask Permission Dialog
    // navigator.mediaDevices.getUserMedia({ video: true });
    if (shouldStart) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((deviceInfos) => {
          const videoDeviceInfos = deviceInfos.filter(
            (deviceInfo) => deviceInfo.kind === "videoinput"
          );
          console.log("videoDeviceInfos", videoDeviceInfos);
          setDeviceInfos(videoDeviceInfos);
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
    }
  }, [shouldStart]);

  useEffect(() => {
    if (deviceInfos.length > 0 && currentDeviceInfoIndex > -1) {
      setMsg("Exact Device");
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

  const handleStart = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then(() => {
      setShouldStart(true);
    });
  };

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

  const [iii, setiii] = useState(true);
  const handleHardSwitch = () => {
    hardSwitch(iii);
    cleanup();
    setiii((prevState) => !prevState);
  };

  return (
    <>
      <Head>
        <title>Camera Test Page</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.heading}>Camera Test</h1>

        <div className={styles.fieldsetContainer}>
          <fieldset>
            <legend>Exact Device:</legend>
            <button
              // onClick={() => setShouldStart(true)}
              onClick={handleStart}
              className={styles.button}
            >
              Start
            </button>
            <button
              onClick={() => {
                setMsg("Exact Device");
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
            <legend>Facing Mode:</legend>
            <button
              onClick={() => {
                setMsg("Facing Mode");
                navigator.mediaDevices.getUserMedia({ video: true });
              }}
              className={styles.button}
            >
              Start
            </button>
            <button
              onClick={() => {
                setMsg("Facing Mode");
                handleHardSwitch();
              }}
              className={styles.button}
            >
              Switch
            </button>
            <button
              onClick={() => {
                setMsg("");
                cleanup();
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
            <span style={{ minHeight: "1rem" }}>{msg}</span>
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
