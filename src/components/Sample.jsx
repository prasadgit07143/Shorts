const Sample = () => {
  return (
    <>
      <video
        id="my-video"
        class="video-js"
        controls
        preload="auto"
        width="640"
        height="264"
        data-setup="{}"
      >
        <source
          type="application/x-mpegurl"
          src="https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8"
        />
      </video>
    </>
  );
};

export default Sample;
