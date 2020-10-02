    // Type aliases (short names)
    var KASFormPageNavigator = KASClient.UI.KASFormPageNavigator;
    var KASFormPage = KASClient.UI.KASFormPage;
    var KASFormEmptyModule = KASClient.UI.KASFormEmptyModule;
    var KASFormDetailsModule = KASClient.UI.KASFormDetailsModule;
    var KASFormImageTitleSubtitleActionModule = KASClient.UI.KASFormImageTitleSubtitleActionModule;
    var printf = KASClient.App.printf;

    // Globals
    var _form = null; // type: KASForm
    var _myFormResponses; // type: Array<KASFormResponse>
    var _creatorInfo; // type: KASUser
    var _conversationName; // type: string
    var _currentUserId; // type: string
    var _pageNavigator = null; // type: KASFormPageNavigator
    var _strings = null;

    // Question index
    var VEHICLEREG = 0;
    var TRIPDATE = 1;
    var OILLEVELS = 2;
    var RADIATORFLUID = 3;
    var CLUTCHBRAKEFLUID = 4;
    var FANBELT = 5;
    var EXHAUSTPIPE = 6;
    var FUELTANK = 7;
    var HEADLIGHTS = 8;
    var SIDELIGHTS = 9;
    var INDICATORLIGHTS = 10;
    var REVERSELIGHTS = 11;
    var WINDSCREEN = 12;
    var SIDEMIRROR = 13;
    var REARMIRROR = 14;
    var PRESSURE = 15;
    var TREAD = 16;
    var SPAREWHEEL = 17;
    var JACKSPANNER = 18;
    var AIDKIT = 19;
    var TRIANGLES = 20;
    var EXTINGUISHER = 21;
    var RADIO = 22;
    ///
    var NAME = 23;
    var PHONE_NUMBER = 24;
    var LOCATION = 25;
    var TIME = 26;

    var _postalCode = "";
    var _district = "";
    var _longAddress = "";
    var _shortAddress = "";

    function inflateHeader() {
      var header = document.getElementById("header");
      KASClient.UI.clearElement(header);

      var navigationBar = new KASClient.UI.KASFormPageNavigationBar();

      navigationBar.iconPath = "download.jpg";

      var mainText = KASClient.UI.getElement("div", {
        "font-size": "18px",
        "color": "#32495f",
        "max-width": "300pt"
      });
      mainText.innerText = _strings["strMiniAppTitle"];

      navigationBar.title = mainText.outerHTML;
      var time = new Date(parseFloat(_myFormResponses.questionToAnswerMap[TIME]));
      var subText = KASClient.UI.getElement("div", {
        "font-size": "9pt",
        "color": "#727d88"
      });
      subText.innerText = printf(_strings["strMiniAppHeaderTimeLabel"], KASClient.getDateString(time, false, true));
      navigationBar.subtitle = subText.outerHTML;

      navigationBar.backAction = function () {
        KASClient.App.dismissCurrentScreen();
      };

      KASClient.UI.addElement(navigationBar.getView(), header);
    }

    function showError(errorMsg) {
      KASClient.App.showNativeErrorMessage(errorMsg);
    }

    function onPageLoad() {
      // Uncomment to test with mock data
      // KASClient.enableMockData();

      // Global error handling

      window.onerror = function (msg, url, line, col, error) {
        // col & error are new to the HTML 5, so handling for them
        var extra = (!col && col !== undefined) ? "" : "#column:" + col;
        extra += (!error && error !== undefined) ? "" : "#error:" + error.stack;
        var error = "Error:" + msg + "#url:" + url + "#line:" + line + extra;
        KASClient.App.logError(error);
      };

      // Remove any existing pages, if any
      if (_pageNavigator) {
        _pageNavigator.popAllPages();
        _pageNavigator = null;
      }
      KASClient.App.getLocalizedStringsAsync(function (strings, error) {
        if (error != null) {
          showAlert("Error:GetFormAsync:" + error);
          return;
        }
        _strings = strings;
        KASClient.Form.getFormAsync(function (form, error) {
          if (error != null) {
            handleError(error);
            return;
          }
          _form = form;
          KASClient.App.getCurrentUserIdAsync(function (userId, error) {
            if (error != null) {
              handleError(error);
              return;
            }
            _currentUserId = userId;
            KASClient.Form.getMyFormResponsesAsync(function (responses, error) {
              if (error != null) {
                handleError(error);
                return;
              }
              _myFormResponses = responses[0];
              KASClient.App.getUsersDetailsAsync([_currentUserId], function (users, error) {
                if (error != null) {
                  handleError(error);
                  return;
                }
                _creatorInfo = users[_currentUserId];
                KASClient.App.getConversationNameAsync(function (name, error) {
                  if (error != null) {
                    handleError(error);
                    return;
                  }
                  _conversationName = name;
                  showSummaryPage();
                });
              });
            });
          });
        });
      });
    }

    //////////////////////////////////////////
    ////////////// ERROR SCREEN //////////////
    //////////////////////////////////////////

    function handleError(errorMsg) {
      hideProgressBar();
      showErrorScreen();
    }

    function showErrorScreen() {
      if (_pageNavigator == null) {
        _pageNavigator = new KASFormPageNavigator();
        var container = document.getElementById("pageNavigator");
        KASClient.UI.addElement(_pageNavigator.getView(), container);
      }

      var errorPage = new KASFormPage();
      errorPage.navigationBar.iconPath = "download.jpg";
      errorPage.navigationBar.title = _strings["strMiniAppTitle"];
      errorPage.moduleContainer.backgroundColor = "white";

      var emptyModule = new KASFormEmptyModule();
      emptyModule.title = "Error";
      emptyModule.subtitle = "Error";
      if (!_pageNavigator.containsPages()) {
        emptyModule.actionTitle = "Error";
        emptyModule.action = onPageLoad;
      }

      errorPage.moduleContainer.addModule(emptyModule);

      _pageNavigator.pushPage(errorPage);
    }

    ////////////////////////////////////////////
    ////////////// SUMMARY SCREEN //////////////
    ////////////////////////////////////////////

    function inflateResponses() {

      document.body.style.backgroundColor = "#f2f2f2";

      var summaryView = document.getElementById("details");
      KASClient.UI.clearElement(summaryView);

      var divAttributes = {
        "background-color": "white",
        "color": "#32485f",
        "font-size": "13.5pt",
        "margin": "16px",
        "margin-top": "8px",
        "margin-bottom": "8px",
        "box-shadow": "0px 0px 1px 0px rgba(0,0,0,0.12)",
        "border-radius": "4px"
      };

      // vehicleReg

      var vehicleRegDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var vehicleRegDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      vehicleRegDetailsHeader.className = "comment-header";
      vehicleRegDetailsHeader.innerText = _strings[_form.questions[VEHICLEREG].title];
      KASClient.UI.addElement(vehicleRegDetailsHeader, vehicleRegDetailsDiv);

      var vehicleRegDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var vehicleReg = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      vehicleReg.innerHTML = _myFormResponses.questionToAnswerMap[VEHICLEREG];

      KASClient.UI.addElement(vehicleReg, vehicleRegDetailsView);
      KASClient.UI.addElement(vehicleRegDetailsView, vehicleRegDetailsDiv);

      // tripDate

      var tripDateDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var tripDateDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      tripDateDetailsHeader.className = "comment-header";
      tripDateDetailsHeader.innerText = _strings[_form.questions[TRIPDATE].title];
      KASClient.UI.addElement(tripDateDetailsHeader, tripDateDetailsDiv);

      var tripDateDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var tripDate = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      tripDate.innerHTML = _myFormResponses.questionToAnswerMap[TRIPDATE];

      KASClient.UI.addElement(tripDate, tripDateDetailsView);
      KASClient.UI.addElement(tripDateDetailsView, tripDateDetailsDiv);

      // oilLevels

      var oilLevelsDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var oilLevelsDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      oilLevelsDetailsHeader.className = "comment-header";
      oilLevelsDetailsHeader.innerText = _strings[_form.questions[OILLEVELS].title];
      KASClient.UI.addElement(oilLevelsDetailsHeader, oilLevelsDetailsDiv);

      var oilLevelsDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var oilLevels = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      oilLevels.innerHTML = _myFormResponses.questionToAnswerMap[OILLEVELS];

      KASClient.UI.addElement(oilLevels, oilLevelsDetailsView);
      KASClient.UI.addElement(oilLevelsDetailsView, oilLevelsDetailsDiv);

      // radiatorFluid

      var radiatorFluidDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var radiatorFluidDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      radiatorFluidDetailsHeader.className = "comment-header";
      radiatorFluidDetailsHeader.innerText = _strings[_form.questions[RADIATORFLUID].title];
      KASClient.UI.addElement(radiatorFluidDetailsHeader, radiatorFluidDetailsDiv);

      var radiatorFluidDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var radiatorFluid = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      radiatorFluid.innerHTML = _myFormResponses.questionToAnswerMap[RADIATORFLUID];

      KASClient.UI.addElement(radiatorFluid, radiatorFluidDetailsView);
      KASClient.UI.addElement(radiatorFluidDetailsView, radiatorFluidDetailsDiv);

      // clutchBrakeFluid

      var clutchBrakeFluidDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var clutchBrakeFluidDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      clutchBrakeFluidDetailsHeader.className = "comment-header";
      clutchBrakeFluidDetailsHeader.innerText = _strings[_form.questions[CLUTCHBRAKEFLUID].title];
      KASClient.UI.addElement(clutchBrakeFluidDetailsHeader, clutchBrakeFluidDetailsDiv);

      var clutchBrakeFluidDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var clutchBrakeFluid = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      clutchBrakeFluid.innerHTML = _myFormResponses.questionToAnswerMap[CLUTCHBRAKEFLUID];

      KASClient.UI.addElement(clutchBrakeFluid, clutchBrakeFluidDetailsView);
      KASClient.UI.addElement(clutchBrakeFluidDetailsView, clutchBrakeFluidDetailsDiv);

      // fanBelt

      var fanBeltDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var fanBeltDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      fanBeltDetailsHeader.className = "comment-header";
      fanBeltDetailsHeader.innerText = _strings[_form.questions[FANBELT].title];
      KASClient.UI.addElement(fanBeltDetailsHeader, fanBeltDetailsDiv);

      var fanBeltDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var fanBelt = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      fanBelt.innerHTML = _myFormResponses.questionToAnswerMap[FANBELT];

      KASClient.UI.addElement(fanBelt, fanBeltDetailsView);
      KASClient.UI.addElement(fanBeltDetailsView, fanBeltDetailsDiv);

      // exhaustPipe

      var exhaustPipeDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var exhaustPipeDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      exhaustPipeDetailsHeader.className = "comment-header";
      exhaustPipeDetailsHeader.innerText = _strings[_form.questions[EXHAUSTPIPE].title];
      KASClient.UI.addElement(exhaustPipeDetailsHeader, exhaustPipeDetailsDiv);

      var exhaustPipeDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var exhaustPipe = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      exhaustPipe.innerHTML = _myFormResponses.questionToAnswerMap[EXHAUSTPIPE];

      KASClient.UI.addElement(exhaustPipe, exhaustPipeDetailsView);
      KASClient.UI.addElement(exhaustPipeDetailsView, exhaustPipeDetailsDiv);

      // fuelTank

      var fuelTankDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var fuelTankDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      fuelTankDetailsHeader.className = "comment-header";
      fuelTankDetailsHeader.innerText = _strings[_form.questions[FUELTANK].title];
      KASClient.UI.addElement(fuelTankDetailsHeader, fuelTankDetailsDiv);

      var fuelTankDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var fuelTank = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      fuelTank.innerHTML = _myFormResponses.questionToAnswerMap[FUELTANK];

      KASClient.UI.addElement(fuelTank, fuelTankDetailsView);
      KASClient.UI.addElement(fuelTankDetailsView, fuelTankDetailsDiv);

      // headLights

      var headLightsDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var headLightsDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      headLightsDetailsHeader.className = "comment-header";
      headLightsDetailsHeader.innerText = _strings[_form.questions[HEADLIGHTS].title];
      KASClient.UI.addElement(headLightsDetailsHeader, headLightsDetailsDiv);

      var headLightsDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var headLights = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      headLights.innerHTML = _myFormResponses.questionToAnswerMap[HEADLIGHTS];

      KASClient.UI.addElement(headLights, headLightsDetailsView);
      KASClient.UI.addElement(headLightsDetailsView, headLightsDetailsDiv);

      // sideLights

      var sideLightsDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var sideLightsDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      sideLightsDetailsHeader.className = "comment-header";
      sideLightsDetailsHeader.innerText = _strings[_form.questions[SIDELIGHTS].title];
      KASClient.UI.addElement(sideLightsDetailsHeader, sideLightsDetailsDiv);

      var sideLightsDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var sideLights = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      sideLights.innerHTML = _myFormResponses.questionToAnswerMap[SIDELIGHTS];

      KASClient.UI.addElement(sideLights, sideLightsDetailsView);
      KASClient.UI.addElement(sideLightsDetailsView, sideLightsDetailsDiv);

      // indicatorLights

      var indicatorLightsDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var indicatorLightsDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      indicatorLightsDetailsHeader.className = "comment-header";
      indicatorLightsDetailsHeader.innerText = _strings[_form.questions[INDICATORLIGHTS].title];
      KASClient.UI.addElement(indicatorLightsDetailsHeader, indicatorLightsDetailsDiv);

      var indicatorLightsDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var indicatorLights = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      indicatorLights.innerHTML = _myFormResponses.questionToAnswerMap[INDICATORLIGHTS];

      KASClient.UI.addElement(indicatorLights, indicatorLightsDetailsView);
      KASClient.UI.addElement(indicatorLightsDetailsView, indicatorLightsDetailsDiv);

      // reverseLights

      var reverseLightsDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var reverseLightsDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      reverseLightsDetailsHeader.className = "comment-header";
      reverseLightsDetailsHeader.innerText = _strings[_form.questions[REVERSELIGHTS].title];
      KASClient.UI.addElement(reverseLightsDetailsHeader, reverseLightsDetailsDiv);

      var reverseLightsDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var reverseLights = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      reverseLights.innerHTML = _myFormResponses.questionToAnswerMap[REVERSELIGHTS];

      KASClient.UI.addElement(reverseLights, reverseLightsDetailsView);
      KASClient.UI.addElement(reverseLightsDetailsView, reverseLightsDetailsDiv);

      // windScreen

      var windScreenDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var windScreenDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      windScreenDetailsHeader.className = "comment-header";
      windScreenDetailsHeader.innerText = _strings[_form.questions[WINDSCREEN].title];
      KASClient.UI.addElement(windScreenDetailsHeader, windScreenDetailsDiv);

      var windScreenDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var windScreen = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      windScreen.innerHTML = _myFormResponses.questionToAnswerMap[WINDSCREEN];

      KASClient.UI.addElement(windScreen, windScreenDetailsView);
      KASClient.UI.addElement(windScreenDetailsView, windScreenDetailsDiv);

      // sideMirror

      var sideMirrorDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var sideMirrorDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      sideMirrorDetailsHeader.className = "comment-header";
      sideMirrorDetailsHeader.innerText = _strings[_form.questions[SIDEMIRROR].title];
      KASClient.UI.addElement(sideMirrorDetailsHeader, sideMirrorDetailsDiv);

      var sideMirrorDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var sideMirror = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      sideMirror.innerHTML = _myFormResponses.questionToAnswerMap[SIDEMIRROR];

      KASClient.UI.addElement(sideMirror, sideMirrorDetailsView);
      KASClient.UI.addElement(sideMirrorDetailsView, sideMirrorDetailsDiv);

      // rearMirror

      var rearMirrorDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var rearMirrorDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      rearMirrorDetailsHeader.className = "comment-header";
      rearMirrorDetailsHeader.innerText = _strings[_form.questions[REARMIRROR].title];
      KASClient.UI.addElement(rearMirrorDetailsHeader, rearMirrorDetailsDiv);

      var rearMirrorDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var rearMirror = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      rearMirror.innerHTML = _myFormResponses.questionToAnswerMap[REARMIRROR];

      KASClient.UI.addElement(rearMirror, rearMirrorDetailsView);
      KASClient.UI.addElement(rearMirrorDetailsView, rearMirrorDetailsDiv);

      // pressure

      var pressureDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var pressureDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      pressureDetailsHeader.className = "comment-header";
      pressureDetailsHeader.innerText = _strings[_form.questions[PRESSURE].title];
      KASClient.UI.addElement(pressureDetailsHeader, pressureDetailsDiv);

      var pressureDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var pressure = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      pressure.innerHTML = _myFormResponses.questionToAnswerMap[PRESSURE];

      KASClient.UI.addElement(pressure, pressureDetailsView);
      KASClient.UI.addElement(pressureDetailsView, pressureDetailsDiv);

      // tread

      var treadDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var treadDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      treadDetailsHeader.className = "comment-header";
      treadDetailsHeader.innerText = _strings[_form.questions[TREAD].title];
      KASClient.UI.addElement(treadDetailsHeader, treadDetailsDiv);

      var treadDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var tread = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      tread.innerHTML = _myFormResponses.questionToAnswerMap[TREAD];

      KASClient.UI.addElement(tread, treadDetailsView);
      KASClient.UI.addElement(treadDetailsView, treadDetailsDiv);

      // spareWheel

      var spareWheelDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var spareWheelDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      spareWheelDetailsHeader.className = "comment-header";
      spareWheelDetailsHeader.innerText = _strings[_form.questions[SPAREWHEEL].title];
      KASClient.UI.addElement(spareWheelDetailsHeader, spareWheelDetailsDiv);

      var spareWheelDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var spareWheel = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      spareWheel.innerHTML = _myFormResponses.questionToAnswerMap[SPAREWHEEL];

      KASClient.UI.addElement(spareWheel, spareWheelDetailsView);
      KASClient.UI.addElement(spareWheelDetailsView, spareWheelDetailsDiv);

      // jackSpanner

      var jackSpannerDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var jackSpannerDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      jackSpannerDetailsHeader.className = "comment-header";
      jackSpannerDetailsHeader.innerText = _strings[_form.questions[JACKSPANNER].title];
      KASClient.UI.addElement(jackSpannerDetailsHeader, jackSpannerDetailsDiv);

      var jackSpannerDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var jackSpanner = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      jackSpanner.innerHTML = _myFormResponses.questionToAnswerMap[JACKSPANNER];

      KASClient.UI.addElement(jackSpanner, jackSpannerDetailsView);
      KASClient.UI.addElement(jackSpannerDetailsView, jackSpannerDetailsDiv);

      // aidKit

      var aidKitDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var aidKitDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      aidKitDetailsHeader.className = "comment-header";
      aidKitDetailsHeader.innerText = _strings[_form.questions[AIDKIT].title];
      KASClient.UI.addElement(aidKitDetailsHeader, aidKitDetailsDiv);

      var aidKitDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var aidKit = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      aidKit.innerHTML = _myFormResponses.questionToAnswerMap[AIDKIT];

      KASClient.UI.addElement(aidKit, aidKitDetailsView);
      KASClient.UI.addElement(aidKitDetailsView, aidKitDetailsDiv);

      // triangles

      var trianglesDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var trianglesDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      trianglesDetailsHeader.className = "comment-header";
      trianglesDetailsHeader.innerText = _strings[_form.questions[TRIANGLES].title];
      KASClient.UI.addElement(trianglesDetailsHeader, trianglesDetailsDiv);

      var trianglesDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var triangles = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      triangles.innerHTML = _myFormResponses.questionToAnswerMap[TRIANGLES];

      KASClient.UI.addElement(triangles, trianglesDetailsView);
      KASClient.UI.addElement(trianglesDetailsView, trianglesDetailsDiv);

      // extinguisher

      var extinguisherDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var extinguisherDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      extinguisherDetailsHeader.className = "comment-header";
      extinguisherDetailsHeader.innerText = _strings[_form.questions[EXTINGUISHER].title];
      KASClient.UI.addElement(extinguisherDetailsHeader, extinguisherDetailsDiv);

      var extinguisherDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var extinguisher = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      extinguisher.innerHTML = _myFormResponses.questionToAnswerMap[EXTINGUISHER];

      KASClient.UI.addElement(extinguisher, extinguisherDetailsView);
      KASClient.UI.addElement(extinguisherDetailsView, extinguisherDetailsDiv);

      // radio

      var radioDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var radioDetailsHeader = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-bottom": "0pt"
      });

      radioDetailsHeader.className = "comment-header";
      radioDetailsHeader.innerText = _strings[_form.questions[RADIO].title];
      KASClient.UI.addElement(radioDetailsHeader, radioDetailsDiv);

      var radioDetailsView = KASClient.UI.getElement("div", {
          "padding": "14px",
          "padding-top": "5pt"
      });

      var radio = KASClient.UI.getElement("div", {
          "color": "#32485f",
          "font-size": "12pt",
          "overflow-wrap": "break-word",
          "word-wrap": "break-word",
          "word-break": "break-word"
      });

      radio.innerHTML = _myFormResponses.questionToAnswerMap[RADIO];

      KASClient.UI.addElement(radio, radioDetailsView);
      KASClient.UI.addElement(radioDetailsView, radioDetailsDiv);

      //end elements

      // Personal Details Summary
      var detailsDiv = KASClient.UI.getElement("div", divAttributes);

      var detailsHeader = KASClient.UI.getElement("div", {
        "padding": "14px",
        "padding-bottom": "0pt"
      });
      detailsHeader.className = "comment-header";
      detailsHeader.innerText = _strings["strMiniAppYourDetails"];
      KASClient.UI.addElement(detailsHeader, detailsDiv);

      var details = KASClient.UI.getElement("table", {
        "border": "none",
        "padding": "14px",
        "padding-top": "5pt",
        "color": "#32485f",
        "font-size": "12pt",
        "overflow-wrap": "break-word",
        "word-wrap": "break-word",
        "word-break": "break-word"
      });

      var row1 = details.insertRow(0);
      var cell11 = row1.insertCell(0);
      var cell12 = row1.insertCell(1);
      cell11.className = "first-column";
      cell11.innerHTML = _strings[_form.questions[NAME].title];
      cell12.innerHTML = ": " + _myFormResponses.questionToAnswerMap[NAME];

      var row2 = details.insertRow(1);
      var cell21 = row2.insertCell(0);
      var cell22 = row2.insertCell(1);
      cell21.className = "first-column";
      cell21.innerHTML = _strings[_form.questions[PHONE_NUMBER].title];
      cell22.innerHTML = ": " + _myFormResponses.questionToAnswerMap[PHONE_NUMBER];

      KASClient.UI.addElement(details, detailsDiv);


      var locationDetailsDiv = KASClient.UI.getElement("div", divAttributes);

      var locationDetailsHeader = KASClient.UI.getElement("div");
      locationDetailsHeader.className = "comment-header";
      locationDetailsHeader.innerText = _strings[_form.questions[LOCATION].title];
      KASClient.UI.addElement(locationDetailsHeader, locationDetailsDiv);
      KASClient.UI.addElement(inflateLocation(), locationDetailsDiv);

      KASClient.UI.addElement(vehicleRegDetailsDiv, summaryView);
      KASClient.UI.addElement(tripDateDetailsDiv, summaryView);
      KASClient.UI.addElement(oilLevelsDetailsDiv, summaryView);
      KASClient.UI.addElement(radiatorFluidDetailsDiv, summaryView);
      KASClient.UI.addElement(clutchBrakeFluidDetailsDiv, summaryView);
      KASClient.UI.addElement(fanBeltDetailsDiv, summaryView);
      KASClient.UI.addElement(exhaustPipeDetailsDiv, summaryView);
      KASClient.UI.addElement(fuelTankDetailsDiv, summaryView);
      KASClient.UI.addElement(headLightsDetailsDiv, summaryView);
      KASClient.UI.addElement(sideLightsDetailsDiv, summaryView);
      KASClient.UI.addElement(indicatorLightsDetailsDiv, summaryView);
      KASClient.UI.addElement(reverseLightsDetailsDiv, summaryView);
      KASClient.UI.addElement(windScreenDetailsDiv, summaryView);
      KASClient.UI.addElement(sideMirrorDetailsDiv, summaryView);
      KASClient.UI.addElement(rearMirrorDetailsDiv, summaryView);
      KASClient.UI.addElement(pressureDetailsDiv, summaryView);
      KASClient.UI.addElement(treadDetailsDiv, summaryView);
      KASClient.UI.addElement(spareWheelDetailsDiv, summaryView);
      KASClient.UI.addElement(jackSpannerDetailsDiv, summaryView);
      KASClient.UI.addElement(aidKitDetailsDiv, summaryView);
      KASClient.UI.addElement(trianglesDetailsDiv, summaryView);
      KASClient.UI.addElement(extinguisherDetailsDiv, summaryView);
      KASClient.UI.addElement(radioDetailsDiv, summaryView);
      KASClient.UI.addElement(detailsDiv, summaryView);

    }

    function showSummaryPage() {

      inflateHeader();
      inflateResponses();
    }

    function inflateLocation() {
      var locationViewDiv = KASClient.UI.getElement("div");

      //location map view
      _currentLocation = JSON.parse(_myFormResponses.questionToAnswerMap[LOCATION]);

      var locationMapView = KASClient.UI.getElement("img");
      if (!(_currentLocation["lt"] == 0.0 && _currentLocation["lg"] == 0.0)) {
        locationMapView.src =
          "https://maps.googleapis.com/maps/api/staticmap?zoom=18&size=360x170&maptype=roadmap&markers=color:blue%7C%7C" +
          _currentLocation["lt"] + "," + _currentLocation["lg"];
      } else {
        locationMapView.style.display = "none";
      }
      locationMapView.className = "location-image";
      locationMapView.onerror = function (event) {
        event.target.style.display = "none";
      }
      var locationAddress = KASClient.UI.getElement("label");
      locationAddress.className = "location-address";

      locationAddress.innerText = _currentLocation["n"];

      var locationAddressDiv = KASClient.UI.getElement("div", {
        "float": "left",
        "display": "flex",
        "flex-direction": "column",
        "width": "100%"
      });

      var locationAddress = KASClient.UI.getElement("label");
      locationAddress.className = "location-address";
      KASClient.UI.addElement(locationAddress, locationAddressDiv);
      if (!(_currentLocation["lt"] == 0.0 && _currentLocation["lg"] == 0.0))
        locationAddress.style.paddingTop = "12px";

      var locationAddressRefreshDiv = KASClient.UI.getElement("div", {
        "display": "inline-flex"
      });

      KASClient.UI.addElement(locationAddressDiv, locationAddressRefreshDiv);

      locationAddress.innerHTML = _currentLocation["n"];

      KASClient.UI.addElement(locationMapView, locationViewDiv);
      KASClient.UI.addElement(locationAddressRefreshDiv, locationViewDiv);

      return locationViewDiv;

    }

    function showError(errorMsg) {
      hideProgressBar();
      KASClient.App.showNativeErrorMessage(errorMsg);
    }

    function dismissCurrentScreen() {
      KASClient.App.dismissCurrentScreen();
    };