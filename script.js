window.addEventListener("load", function () {
  let selectedDeviceId;
  const codeReader = new ZXing.BrowserMultiFormatReader();
  console.log("ZXing code reader initialized");
  codeReader.listVideoInputDevices().then((videoInputDevices) => {
    selectedDeviceId = videoInputDevices[0].deviceId;

    const sourceSelect = this.document.getElementById('sourceSelect');
    if (videoInputDevices.length >= 1) {
      console.log(videoInputDevices);
      videoInputDevices.forEach((element) => {
        const sourceOption = this.document.createElement('option');
        sourceOption.text = element.label
        sourceOption.value = element.deviceId
        sourceSelect.appendChild(sourceOption);
      })
      
      sourceSelect.onchange = () => {
        selectedDeviceId = sourceSelect.value
      }

      const sourceSelectPanel = this.document.getElementById('sourceSelectPanel');
      sourceSelectPanel.style.display = 'block'
    }

    const startButton = this.document.getElementById("startButton");
    const qrLine = this.document.querySelector('.qrbox');


    startButton.addEventListener("click", () => {
      document.getElementById("video").style.display = "block";
      startButton.style.display = "none";
      qrLine.style.display = "block"
      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        "video",
        (result, err) => {
          if (err && !(err instanceof ZXing.NotFoundException)) {
            console.log(err);
          }
          if (result) {
            getGuestCode(result.text);
          }
        }
      );
    });

    const supa = supabase.createClient(
      "https://xyxsiuaxedneofkbjsej.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eHNpdWF4ZWRuZW9ma2Jqc2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM0MjU3NTUsImV4cCI6MTk4OTAwMTc1NX0.8MBu6aioyxUwOCrpGaEXXtlznwTHgP9zafPmxVCDqAQ"
    );

    const modal = this.document.querySelector(".modal");
    const successAudio = this.document.querySelector("#success-audio");
    const formName = this.document.querySelector("#name");
    const formDescription = this.document.querySelector("#description");
    const formType = this.document.querySelector("#type");
    const formTotalGuest = this.document.querySelector("#total_guest");
    const timeElement = this.document.querySelector(".time");
    const submitButton = this.document.querySelector(".submit-button");
    const decrementButton = this.document.querySelector(".decrement");
    const incrementButton = this.document.querySelector(".increment");
    const closeButton = this.document.querySelector('.close');

    closeButton.addEventListener('click', () => {
      modal.style.display = 'none'
    })

    let total_guest = 1;

    const openModal = (data) => {
      if (data !== null && data !== undefined) {
        modal.style.display = "flex";
        successAudio.play();
        formName.value = data.name || "";
        formDescription.value = data.description || "";
        formTotalGuest.value = data.total_guest || 1;
        formType.value = data.type || "";
        let checkin_time = new Date();
        timeElement.innerHTML = `${checkin_time.getDate()}-${
          checkin_time.getMonth() + 1
        }-${checkin_time.getFullYear()} | ${checkin_time.getHours()}:${checkin_time.getMinutes()}:${checkin_time.getSeconds()}`;
      }
    };

    decrementButton.addEventListener("click", () => {
      if (total_guest <= 0) {
        total_guest = 0;
        formTotalGuest.value = total_guest;
      } else {
        total_guest--;
        formTotalGuest.value = total_guest;
      }
    });

    incrementButton.addEventListener("click", () => {
      total_guest++;
      formTotalGuest.value = total_guest;
    });

    submitButton.addEventListener("click", () => {
      if (formName.value.length == 0) {
        this.alert("name required!");
      } else {
        insertGuest();
      }
    });

    async function insertGuest() {
      try {
        let { data, error } = await supa
          .from("guestpresent")
          .insert([
            {
              name: formName.value,
              description: formDescription.value || "TAMU UNDANGAN",
              type: formType.value || "BASIC GUEST",
              total_guest: formTotalGuest.value || 1,
            },
          ])
          .select();
        if (data) {
          formName.value = "";
          formDescription.value = "";
          formType.value = "";
          formTotalGuest.value = "";
          modal.style.display = "none";
          sendToGreeting(data[0]);
        }
      } catch (error) {
        console.log(error);
        alert("something went wrong");
      }
    }

    function sendToGreeting(data) {
      const channel = supa.channel("greeting").subscribe((status) => {
        console.log(data);
        if (status === "SUBSCRIBED") {
          channel.send({
            type: "broadcast",
            event: "supa",
            payload: data,
          });
        }
      });
    }

    async function getGuestCode(code) {
      try {
        if (code === "rr230323fromonline") {
          let data = [{ name: "", description: "", type: "GUEST" }];
          openModal(data);
          return false;
        }
        let { data, error } = await supa
          .from("guestsbook")
          .select("*")
          .eq("guest_code", code);
        if (error) {
          console.log(error);
          alert("something went wrong please try again later");
        }
        if (data) {
          openModal(data[0]);
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
});
