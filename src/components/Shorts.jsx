import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faVolumeHigh,
  faVolumeXmark,
  faAngleUp,
  faAngleDown,
  faHeart,
  faShare,
  faInfo,
} from "@fortawesome/free-solid-svg-icons";
import videoData from "./DataProvider";
import shortVideo from "../assets/videos/big_buck_bunny_720p_1mb.mp4";
import shortVideo1 from "../assets/videos/big_buck_bunny_720p_1mb.m3u8";

const Short = memo(({ video, isVisible, index }) => {
  const [playState, setPlayState] = useState(isVisible);
  const [muteState, setMuteState] = useState(true);
  const [likeState, setLikeState] = useState(
    () => localStorage.getItem(`like_video_${index}`) === "true"
  );
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  const updatePlayState = useCallback(() => {
    setPlayState((prevState) => {
      const newState = !prevState;
      videoRef.current?.[newState ? "play" : "pause"]();
      return newState;
    });
  }, []);

  const updateMuteState = useCallback(() => {
    setMuteState((prevState) => {
      const newState = !prevState;
      if (videoRef.current) videoRef.current.muted = newState;
      return newState;
    });
  }, []);

  const handleLike = useCallback(() => {
    setLikeState((prevState) => {
      const newState = !prevState;
      localStorage.setItem(`like_video_${index}`, newState.toString());
      return newState;
    });
  }, [index]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isVisible) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setPlayState(true);
    } else {
      videoRef.current.pause();
      setPlayState(false);
    }
  }, [isVisible]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, []);

  return (
    <div onDoubleClick={handleLike} className="short | flex jcc fdc">
      <video
        className="video-js"
        preload="auto"
        data-setup="{}"
        onClick={updatePlayState}
        ref={videoRef}
        autoPlay
        muted
        playsInline
        loop
      >
        <source type="application/x-mpegurl" src={shortVideo1} />
      </video>
      {/* <video
        preload="auto"
        onClick={updatePlayState}
        ref={videoRef}
        autoPlay
        muted
        playsInline
        loop
        src={shortVideo}
      ></video> */}
      <div className="video-progress-wrapper | flex aife">
        <div
          className="video-progress-bar"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>

      <div className="video-details | w-100">
        <span className="video-title | fz-14 fw-400">{video.title}</span>
        <br />
        {video.tags.map((tag) => (
          <span key={tag} className="video-tag">{`#${tag} `}</span>
        ))}
      </div>
      <div className="video-controls | flex aic w-100 fz-18">
        <button onClick={updatePlayState} className="video-play-pause-btn">
          <FontAwesomeIcon icon={playState ? faPause : faPlay} />
        </button>
        <button onClick={updateMuteState} className="video-mute-unmute-btn">
          <FontAwesomeIcon icon={muteState ? faVolumeXmark : faVolumeHigh} />
        </button>
      </div>
      <div className="video-info-wrapper | flex aic jcfe fdc">
        <div
          onClick={handleLike}
          className={`video-info likes-wrapper | center fz-24 ${
            likeState ? "likes-wrapper-active" : ""
          }`}
        >
          <span>
            <FontAwesomeIcon icon={faHeart} />
          </span>
        </div>
        <div className="video-info share-wrapper | center">
          <span>
            <FontAwesomeIcon icon={faShare} />
          </span>
        </div>
        <div className="video-info info-wrapper | center">
          <span>
            <FontAwesomeIcon icon={faInfo} />
          </span>
        </div>
      </div>
    </div>
  );
});

const Shorts = () => {
  const [visibleIndex, setVisibleIndex] = useState(() => {
    const savedIndex = localStorage.getItem("lastSeenVideoIndex");
    return savedIndex !== null ? parseInt(savedIndex, 10) : 0;
  });
  const sectionRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;

    const updateVisibleIndex = () => {
      const shorts = sectionRef.current.querySelectorAll(".short");
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const sectionCenter = sectionRect.top + sectionRect.height / 2;

      shorts.forEach((short, index) => {
        const rect = short.getBoundingClientRect();
        const shortCenter = rect.top + rect.height / 2;
        if (Math.abs(sectionCenter - shortCenter) < rect.height / 2) {
          setVisibleIndex(index);
        }
      });
    };

    requestAnimationFrame(updateVisibleIndex);
  }, []);

  const scrollToIndex = useCallback((index) => {
    sectionRef.current
      ?.querySelectorAll(".short")
      [index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const scrollToPrevious = useCallback(() => {
    setVisibleIndex((prevIndex) => {
      const newIndex = Math.max(0, prevIndex - 1);
      scrollToIndex(newIndex);
      return newIndex;
    });
  }, [scrollToIndex]);

  const scrollToNext = useCallback(() => {
    setVisibleIndex((prevIndex) => {
      const newIndex = Math.min(videoData.length - 1, prevIndex + 1);
      scrollToIndex(newIndex);
      return newIndex;
    });
  }, [scrollToIndex]);

  useEffect(() => {
    localStorage.setItem("lastSeenVideoIndex", visibleIndex.toString());
  }, [visibleIndex]);

  useEffect(() => {
    scrollToIndex(visibleIndex);
  }, [visibleIndex, scrollToIndex]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    section.addEventListener("scroll", handleScroll);
    scrollToIndex(visibleIndex);
    handleScroll();

    return () => section.removeEventListener("scroll", handleScroll);
  }, [handleScroll, scrollToIndex, visibleIndex]);

  return (
    <section className="shorts-section | h-100 center" ref={sectionRef}>
      <div className="short-wrapper | ff-roboto flex aic fdc">
        {videoData.map((video, videoIndex) => (
          <Short
            key={videoIndex}
            video={video}
            isVisible={videoIndex === visibleIndex}
            index={videoIndex}
          />
        ))}
        <div className="video-nav-controls | flex fdc jcsb fz-24">
          <div onClick={scrollToPrevious} className="nav-btn-wrapper | center">
            <span className="nav-btn prev">
              <FontAwesomeIcon icon={faAngleUp} />
            </span>
          </div>
          <div onClick={scrollToNext} className="nav-btn-wrapper | center">
            <span className="nav-btn next">
              <FontAwesomeIcon icon={faAngleDown} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shorts;
