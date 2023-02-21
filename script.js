window.addEventListener("load", function () {
  let selectedDeviceId;
  const codeReader = new ZXing.BrowserMultiFormatReader();
  console.log("ZXing code reader initialized");
  codeReader.listVideoInputDevices().then((videoInputDevices) => {
    selectedDeviceId = videoInputDevices[0].deviceId;

    const startButton = this.document.getElementById("startButton");

    startButton.addEventListener("click", () => {
      document.getElementById("video").style.display = "block";
      startButton.style.display = "none";
      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        "video",
        (result, err) => {
          if (err && !(err instanceof ZXing.NotFoundException)) {
            console.log(err);
            this.alert(err);
          }
          if (result) {
            console.log(result);
            this.alert(result);
          }
        }
      );
    });
  });
});
