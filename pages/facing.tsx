import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
// @ts-ignore
import styles from "../styles/Home.module.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    alert(JSON.stringify(error) + JSON.stringify(errorInfo));
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function FacingPage() {
  const [facingMode, setFacingMode] = useState("");
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

        const deviceInfos = navigator.mediaDevices
          .enumerateDevices()
          .then((deviceInfos) => {
            const videoDeviceInfos = deviceInfos.filter(
              (deviceInfo) => deviceInfo.kind === "videoinput"
            );
            console.log("videoDeviceInfos", videoDeviceInfos);

            return deviceInfos;
          })
          .catch(handleError);

        // @ts-ignore
        if (deviceInfos && deviceInfos.length > 0) {
          setFacingMode("environment");
        }
      })
      .catch((err) => {
        console.log("err", err);
        alert("You blocked Camera Permission.");
      });
  }, []);

  useEffect(() => {
    console.log("facingMode", facingMode);
    // navigator.mediaDevices.enumerateDevices().then((devices) => {
    // if (devices.filter((device) => device.kind === "videoinput").length > 1) {
    // call getUserMedia first for permission prompt on iOS
    if (facingMode !== "") {
      const allowedStream = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: { facingMode },
        })
        .catch((e) => {
          console.log("switch camera error", e);
          alert("Error occurred");
        });

      allowedStream.then((stream) => {
        console.log(stream);
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
      });
      // }
      // });
    }
  }, [facingMode]);

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
    clearMediaStream();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    setMsg(facingMode === "environment" ? "back" : "front");
  }, [facingMode]);

  return (
    <>
      <Head>
        <title>Exact Device | Camera Test Page</title>
      </Head>
      {/* <ErrorBoundary> */}
      <div className={styles.container}>
        <h1 className={styles.heading}>Camera Test</h1>

        <div className={styles.fieldsetContainer}>
          <fieldset>
            <legend>Facing Mode:</legend>
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
      {/* </ErrorBoundary> */}
    </>
  );
}
