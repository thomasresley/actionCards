    // Type aliases (short names)
    var printf = KASClient.App.printf;

    var _form; // type: KASForm
    var api = "https://intense-taiga-44684.herokuapp.com/";

    var _vehicleReg = "";
    var _tripDate = "";
    var _oilLevels = "";
    var _radiatorFluid = "";
    var _clutchBrakeFluid = "";
    var _fanBelt = "";
    var _exhaustPipe = "";
    var _fuelTank = "";
    var _headLights = "";
    var _sideLights = "";
    var _indicatorLights = "";
    var _reverseLights = "";
    var _windScreen = "";
    var _sideMirror = "";
    var _rearMirror = "";
    var _pressure = "";
    var _tread = "";
    var _spareWheel = "";
    var _jackSpanner = "";
    var _aidKit = "";
    var _triangles = "";
    var _extinguisher = "";
    var _radio = "";
    ///
    var _name = "";
    var _phoneNumber = "";
    var _currentLocation = {};

    var _currentPage = 1;
    var _isLocationRefreshing = false;
    var _strings = null;
    var _currentUserInfo = null;
    var _longAddress = "";
    var _shortAddress = "";
    var _isLocationNotFetched = true;
    var _isTripActive = false;
    var _regExists = true;

    // constants
    var TOTAL_PAGE = 7;
    var LOCATION_TIMEOUT = 10000;

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

    function onPageLoad() {

        // Register for Android h/w back press event
        KASClient.App.registerHardwareBackPressCallback(function () {
            KASClient.App.dismissCurrentScreen();
        });

        KASClient.App.getLocalizedStringsAsync(function (strings, error) {
            if (error != null) {
                showAlert("Error:GetFormAsync:" + error);
                return;
            }
            _strings = strings;
            KASClient.Form.getFormAsync(function (form, error) {
                if (error != null) {
                    showAlert("Error:GetFormAsync:" + error);
                    return;
                }
                _form = form;
                inflateHTML();
                inflateQuestions();
                KASClient.App.getCurrentUserIdAsync(function (userId, error) {
                    if (error != null) {
                        handleError(error);
                        return;
                    }
                    KASClient.App.getUsersDetailsAsync([userId], function (users, error) {
                        if (error != null) {
                            handleError(error);
                            return;
                        }
                        _currentUserInfo = users[userId];
                        _name = _currentUserInfo.originalName;
                        _phoneNumber = _currentUserInfo.phoneNumber;

                        const url = `${api}company/getActiveTripByDriver?phone=${_phoneNumber.substring(1)}`;

                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", url, true);
                        xhr.onload = function (e) {
                            if (xhr.status === 200) {
                                var response = JSON.parse(xhr.responseText);
                                if (response.length > 0) {
                                    _isTripActive = true;
                                    showError("You have an active trip. End it to continue.");
                                }
                            } else {
                                _isTripActive = false;
                            }
                        };
                        xhr.send(null);
                        
                        inflateDetailsView();                        
                    });
                });
            });
        });
    }

    function refreshLocation() {
        if (_isLocationRefreshing == true)
            return;

        _isLocationRefreshing = true
        KASClient.App.getCurrentDeviceLocationAsync(function (location, error) {
            if (error != null) {
                _isLocationRefreshing = false;
                inflateLocationView();
                return;
            }

            _currentLocation = JSON.parse(location);
            fetchAndPopulateAddress();
        });

        setTimeout(function () {
            if (_isLocationRefreshing == true) {
                _isLocationRefreshing = false;
                inflateLocationView();
            }
        }, LOCATION_TIMEOUT);
    }

    function submitFormResponse() {
        if (!_currentLocation.hasOwnProperty("lt")) {
            _currentLocation["lt"] = 0.0;
        }

        if (!_currentLocation.hasOwnProperty("lg")) {
            _currentLocation["lg"] = 0.0;
        }

        if (!_currentLocation.hasOwnProperty("n")) {
            _currentLocation["n"] = "";
        }

        var questionToAnswerMap = JSON.parse("{}");

        questionToAnswerMap[VEHICLEREG] = _vehicleReg;
        questionToAnswerMap[TRIPDATE] = _tripDate;
        questionToAnswerMap[OILLEVELS] = _oilLevels;
        questionToAnswerMap[RADIATORFLUID] = _radiatorFluid;
        questionToAnswerMap[CLUTCHBRAKEFLUID] = _clutchBrakeFluid;
        questionToAnswerMap[FANBELT] = _fanBelt;
        questionToAnswerMap[EXHAUSTPIPE] = _exhaustPipe;
        questionToAnswerMap[FUELTANK] = _fuelTank;
        questionToAnswerMap[HEADLIGHTS] = _headLights;
        questionToAnswerMap[SIDELIGHTS] = _sideLights;
        questionToAnswerMap[INDICATORLIGHTS] = _indicatorLights;
        questionToAnswerMap[REVERSELIGHTS] = _reverseLights;
        questionToAnswerMap[WINDSCREEN] = _windScreen;
        questionToAnswerMap[SIDEMIRROR] = _sideMirror;
        questionToAnswerMap[REARMIRROR] = _rearMirror;
        questionToAnswerMap[PRESSURE] = _pressure;
        questionToAnswerMap[TREAD] = _tread;
        questionToAnswerMap[SPAREWHEEL] = _spareWheel;
        questionToAnswerMap[JACKSPANNER] = _jackSpanner;
        questionToAnswerMap[AIDKIT] = _aidKit;
        questionToAnswerMap[TRIANGLES] = _triangles;
        questionToAnswerMap[EXTINGUISHER] = _extinguisher;
        questionToAnswerMap[RADIO] = _radio;
        ////
        questionToAnswerMap[NAME] = _name;
        questionToAnswerMap[PHONE_NUMBER] = _phoneNumber;
        questionToAnswerMap[LOCATION] = JSON.stringify(_currentLocation);
        questionToAnswerMap[TIME] = (new Date()).getTime();

        // Finally submit the response
        KASClient.Form.sumbitFormResponse(questionToAnswerMap, null, false, true /* showInChatCanvas */);
    }

    // handling UI
    function inflateHTML() {
        // header
        inflateHeader();

        updatePage();
    }

    function updatePage() {
        for (var i = 1; i <= TOTAL_PAGE; i++) {
            document.getElementById("page" + i).style.display = _currentPage == i ? "block" : "none";
            document.body.style.backgroundColor = _currentPage == TOTAL_PAGE ? "#f2f2f2" : "white";
        }

        if (_currentPage == 6 && _isLocationNotFetched) {
            _isLocationNotFetched = false;
            refreshLocation();
            inflateLocationView();
        }
        if (_currentPage == 2 || _currentPage == 3 || _currentPage == 4 || _currentPage == 5 || _currentPage == 6) {
            checkRegExists();
        }
        if (_currentPage == TOTAL_PAGE) {

            checkRegExists();
            inflateSummaryView();
        }
        // footer
        inflateFooterView();
    }

    function inflateHeader() {
        var header = document.getElementById("header");
        KASClient.UI.clearElement(header);

        var navigationBar = new KASClient.UI.KASFormPageNavigationBar();
        navigationBar.backAsset = "close.png";

        var mainText = KASClient.UI.getElement("div", {
            "font-size": "12pt",
            "color": "#32495f",
            "max-width": "300pt",
            "font-weight": "500"
        });
        mainText.innerText = _strings["strMiniAppTitle"];

        navigationBar.title = mainText.outerHTML;

        navigationBar.backAction = function () {
            KASClient.App.dismissCurrentScreen();
        };

        KASClient.UI.addElement(navigationBar.getView(), header);
    }

    function inflateVehicleRegDiv() {
        var vehicleRegDiv = document.getElementById("vehicleRegDiv");
        KASClient.UI.clearElement(vehicleRegDiv);

        var vehicleRegTitle = KASClient.UI.getElement("div");
        vehicleRegTitle.className = "question-title";
        vehicleRegTitle.innerText = _strings[_form.questions[VEHICLEREG].title];

        var vehicleRegInput = KASClient.UI.getElement("input");
        vehicleRegInput.type = "text";
        vehicleRegInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(vehicleRegInput, {
                "padding-left": "13pt"
            });
        }
        vehicleRegInput.placeholder = _strings["strVehicleReg"];
        vehicleRegInput.addEventListener("input", function (event) {
            _vehicleReg = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(vehicleRegTitle, vehicleRegDiv);
        KASClient.UI.addElement(vehicleRegInput, vehicleRegDiv);
    }

    function inflateTripDateDiv() {
        var tripDateDiv = document.getElementById("tripDateDiv");
        KASClient.UI.clearElement(tripDateDiv);

        var tripDateTitle = KASClient.UI.getElement("div");
        tripDateTitle.className = "question-title";
        tripDateTitle.innerText = _strings[_form.questions[TRIPDATE].title];

        var tripDateInput = KASClient.UI.getElement("input");
        tripDateInput.type = "text";
        tripDateInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(tripDateInput, {
                "padding-left": "13pt"
            });
        }
        tripDateInput.placeholder = _strings["strDateFormat"];
        tripDateInput.addEventListener("input", function (event) {
            _tripDate = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(tripDateTitle, tripDateDiv);
        KASClient.UI.addElement(tripDateInput, tripDateDiv);
    }

    function inflateOilLevelsDiv() {
        var oilLevelsDiv = document.getElementById("oilLevelsDiv");
        KASClient.UI.clearElement(oilLevelsDiv);

        var oilLevelsTitle = KASClient.UI.getElement("div");
        oilLevelsTitle.className = "question-title";
        oilLevelsTitle.innerText = _strings[_form.questions[OILLEVELS].title];

        var oilLevelsInput = KASClient.UI.getElement("input");
        oilLevelsInput.type = "text";
        oilLevelsInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(oilLevelsInput, {
                "padding-left": "13pt"
            });
        }
        oilLevelsInput.placeholder = _strings["strValueComment"];
        oilLevelsInput.addEventListener("input", function (event) {
            _oilLevels = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(oilLevelsTitle, oilLevelsDiv);
        KASClient.UI.addElement(oilLevelsInput, oilLevelsDiv);
    }

    function inflateRadiatorFluidDiv() {
        var radiatorFluidDiv = document.getElementById("radiatorFluidDiv");
        KASClient.UI.clearElement(radiatorFluidDiv);

        var radiatorFluidTitle = KASClient.UI.getElement("div");
        radiatorFluidTitle.className = "question-title";
        radiatorFluidTitle.innerText = _strings[_form.questions[RADIATORFLUID].title];

        var radiatorFluidInput = KASClient.UI.getElement("input");
        radiatorFluidInput.type = "text";
        radiatorFluidInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(radiatorFluidInput, {
                "padding-left": "13pt"
            });
        }
        radiatorFluidInput.placeholder = _strings["strValueComment"];
        radiatorFluidInput.addEventListener("input", function (event) {
            _radiatorFluid = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(radiatorFluidTitle, radiatorFluidDiv);
        KASClient.UI.addElement(radiatorFluidInput, radiatorFluidDiv);
    }

    function inflateClutchBrakeFluidDiv() {
        var clutchBrakeFluidDiv = document.getElementById("clutchBrakeFluidDiv");
        KASClient.UI.clearElement(clutchBrakeFluidDiv);

        var clutchBrakeFluidTitle = KASClient.UI.getElement("div");
        clutchBrakeFluidTitle.className = "question-title";
        clutchBrakeFluidTitle.innerText = _strings[_form.questions[CLUTCHBRAKEFLUID].title];

        var clutchBrakeFluidInput = KASClient.UI.getElement("input");
        clutchBrakeFluidInput.type = "text";
        clutchBrakeFluidInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(clutchBrakeFluidInput, {
                "padding-left": "13pt"
            });
        }
        clutchBrakeFluidInput.placeholder = _strings["strValueComment"];
        clutchBrakeFluidInput.addEventListener("input", function (event) {
            _clutchBrakeFluid = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(clutchBrakeFluidTitle, clutchBrakeFluidDiv);
        KASClient.UI.addElement(clutchBrakeFluidInput, clutchBrakeFluidDiv);
    }

    function inflateFanBeltDiv() {
        var fanBeltDiv = document.getElementById("fanBeltDiv");
        KASClient.UI.clearElement(fanBeltDiv);

        var fanBeltTitle = KASClient.UI.getElement("div");
        fanBeltTitle.className = "question-title";
        fanBeltTitle.innerText = _strings[_form.questions[FANBELT].title];

        var fanBeltInput = KASClient.UI.getElement("input");
        fanBeltInput.type = "text";
        fanBeltInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(fanBeltInput, {
                "padding-left": "13pt"
            });
        }
        fanBeltInput.placeholder = _strings["strValueComment"];
        fanBeltInput.addEventListener("input", function (event) {
            _fanBelt = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(fanBeltTitle, fanBeltDiv);
        KASClient.UI.addElement(fanBeltInput, fanBeltDiv);
    }

    function inflateExhaustPipeDiv() {
        var exhaustPipeDiv = document.getElementById("exhaustPipeDiv");
        KASClient.UI.clearElement(exhaustPipeDiv);

        var exhaustPipeTitle = KASClient.UI.getElement("div");
        exhaustPipeTitle.className = "question-title";
        exhaustPipeTitle.innerText = _strings[_form.questions[EXHAUSTPIPE].title];

        var exhaustPipeInput = KASClient.UI.getElement("input");
        exhaustPipeInput.type = "text";
        exhaustPipeInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(exhaustPipeInput, {
                "padding-left": "13pt"
            });
        }
        exhaustPipeInput.placeholder = _strings["strValueComment"];
        exhaustPipeInput.addEventListener("input", function (event) {
            _exhaustPipe = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(exhaustPipeTitle, exhaustPipeDiv);
        KASClient.UI.addElement(exhaustPipeInput, exhaustPipeDiv);
    }

    function inflateFuelTankDiv() {
        var fuelTankDiv = document.getElementById("fuelTankDiv");
        KASClient.UI.clearElement(fuelTankDiv);

        var fuelTankTitle = KASClient.UI.getElement("div");
        fuelTankTitle.className = "question-title";
        fuelTankTitle.innerText = _strings[_form.questions[FUELTANK].title];

        var fuelTankInput = KASClient.UI.getElement("input");
        fuelTankInput.type = "text";
        fuelTankInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(fuelTankInput, {
                "padding-left": "13pt"
            });
        }
        fuelTankInput.placeholder = _strings["strValueComment"];
        fuelTankInput.addEventListener("input", function (event) {
            _fuelTank = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(fuelTankTitle, fuelTankDiv);
        KASClient.UI.addElement(fuelTankInput, fuelTankDiv);
    }

    function inflateHeadLightsDiv() {
        var headLightsDiv = document.getElementById("headLightsDiv");
        KASClient.UI.clearElement(headLightsDiv);

        var headLightsTitle = KASClient.UI.getElement("div");
        headLightsTitle.className = "question-title";
        headLightsTitle.innerText = _strings[_form.questions[HEADLIGHTS].title];

        var headLightsInput = KASClient.UI.getElement("input");
        headLightsInput.type = "text";
        headLightsInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(headLightsInput, {
                "padding-left": "13pt"
            });
        }
        headLightsInput.placeholder = _strings["strValueComment"];
        headLightsInput.addEventListener("input", function (event) {
            _headLights = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(headLightsTitle, headLightsDiv);
        KASClient.UI.addElement(headLightsInput, headLightsDiv);
    }

    function inflateSideLightsDiv() {
        var sideLightsDiv = document.getElementById("sideLightsDiv");
        KASClient.UI.clearElement(sideLightsDiv);

        var sideLightsTitle = KASClient.UI.getElement("div");
        sideLightsTitle.className = "question-title";
        sideLightsTitle.innerText = _strings[_form.questions[SIDELIGHTS].title];

        var sideLightsInput = KASClient.UI.getElement("input");
        sideLightsInput.type = "text";
        sideLightsInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(sideLightsInput, {
                "padding-left": "13pt"
            });
        }
        sideLightsInput.placeholder = _strings["strValueComment"];
        sideLightsInput.addEventListener("input", function (event) {
            _sideLights = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(sideLightsTitle, sideLightsDiv);
        KASClient.UI.addElement(sideLightsInput, sideLightsDiv);
    }

    function inflateIndicatorLightsDiv() {
        var indicatorLightsDiv = document.getElementById("indicatorLightsDiv");
        KASClient.UI.clearElement(indicatorLightsDiv);

        var indicatorLightsTitle = KASClient.UI.getElement("div");
        indicatorLightsTitle.className = "question-title";
        indicatorLightsTitle.innerText = _strings[_form.questions[INDICATORLIGHTS].title];

        var indicatorLightsInput = KASClient.UI.getElement("input");
        indicatorLightsInput.type = "text";
        indicatorLightsInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(indicatorLightsInput, {
                "padding-left": "13pt"
            });
        }
        indicatorLightsInput.placeholder = _strings["strValueComment"];
        indicatorLightsInput.addEventListener("input", function (event) {
            _indicatorLights = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(indicatorLightsTitle, indicatorLightsDiv);
        KASClient.UI.addElement(indicatorLightsInput, indicatorLightsDiv);
    }

    function inflateReverseLightsDiv() {
        var reverseLightsDiv = document.getElementById("reverseLightsDiv");
        KASClient.UI.clearElement(reverseLightsDiv);

        var reverseLightsTitle = KASClient.UI.getElement("div");
        reverseLightsTitle.className = "question-title";
        reverseLightsTitle.innerText = _strings[_form.questions[REVERSELIGHTS].title];

        var reverseLightsInput = KASClient.UI.getElement("input");
        reverseLightsInput.type = "text";
        reverseLightsInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(reverseLightsInput, {
                "padding-left": "13pt"
            });
        }
        reverseLightsInput.placeholder = _strings["strValueComment"];
        reverseLightsInput.addEventListener("input", function (event) {
            _reverseLights = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(reverseLightsTitle, reverseLightsDiv);
        KASClient.UI.addElement(reverseLightsInput, reverseLightsDiv);
    }

    function inflateWindScreenDiv() {
        var windScreenDiv = document.getElementById("windScreenDiv");
        KASClient.UI.clearElement(windScreenDiv);

        var windScreenTitle = KASClient.UI.getElement("div");
        windScreenTitle.className = "question-title";
        windScreenTitle.innerText = _strings[_form.questions[WINDSCREEN].title];

        var windScreenInput = KASClient.UI.getElement("input");
        windScreenInput.type = "text";
        windScreenInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(windScreenInput, {
                "padding-left": "13pt"
            });
        }
        windScreenInput.placeholder = _strings["strValueComment"];
        windScreenInput.addEventListener("input", function (event) {
            _windScreen = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(windScreenTitle, windScreenDiv);
        KASClient.UI.addElement(windScreenInput, windScreenDiv);
    }

    function inflateSideMirrorDiv() {
        var sideMirrorDiv = document.getElementById("sideMirrorDiv");
        KASClient.UI.clearElement(sideMirrorDiv);

        var sideMirrorTitle = KASClient.UI.getElement("div");
        sideMirrorTitle.className = "question-title";
        sideMirrorTitle.innerText = _strings[_form.questions[SIDEMIRROR].title];

        var sideMirrorInput = KASClient.UI.getElement("input");
        sideMirrorInput.type = "text";
        sideMirrorInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(sideMirrorInput, {
                "padding-left": "13pt"
            });
        }
        sideMirrorInput.placeholder = _strings["strValueComment"];
        sideMirrorInput.addEventListener("input", function (event) {
            _sideMirror = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(sideMirrorTitle, sideMirrorDiv);
        KASClient.UI.addElement(sideMirrorInput, sideMirrorDiv);
    }

    function inflateRearMirrorDiv() {
        var rearMirrorDiv = document.getElementById("rearMirrorDiv");
        KASClient.UI.clearElement(rearMirrorDiv);

        var rearMirrorTitle = KASClient.UI.getElement("div");
        rearMirrorTitle.className = "question-title";
        rearMirrorTitle.innerText = _strings[_form.questions[REARMIRROR].title];

        var rearMirrorInput = KASClient.UI.getElement("input");
        rearMirrorInput.type = "text";
        rearMirrorInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(rearMirrorInput, {
                "padding-left": "13pt"
            });
        }
        rearMirrorInput.placeholder = _strings["strValueComment"];
        rearMirrorInput.addEventListener("input", function (event) {
            _rearMirror = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(rearMirrorTitle, rearMirrorDiv);
        KASClient.UI.addElement(rearMirrorInput, rearMirrorDiv);
    }

    function inflatePressureDiv() {
        var pressureDiv = document.getElementById("pressureDiv");
        KASClient.UI.clearElement(pressureDiv);

        var pressureTitle = KASClient.UI.getElement("div");
        pressureTitle.className = "question-title";
        pressureTitle.innerText = _strings[_form.questions[PRESSURE].title];

        var pressureInput = KASClient.UI.getElement("input");
        pressureInput.type = "text";
        pressureInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(pressureInput, {
                "padding-left": "13pt"
            });
        }
        pressureInput.placeholder = _strings["strValueComment"];
        pressureInput.addEventListener("input", function (event) {
            _pressure = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(pressureTitle, pressureDiv);
        KASClient.UI.addElement(pressureInput, pressureDiv);
    }

    function inflateTreadDiv() {
        var treadDiv = document.getElementById("treadDiv");
        KASClient.UI.clearElement(treadDiv);

        var treadTitle = KASClient.UI.getElement("div");
        treadTitle.className = "question-title";
        treadTitle.innerText = _strings[_form.questions[TREAD].title];

        var treadInput = KASClient.UI.getElement("input");
        treadInput.type = "text";
        treadInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(treadInput, {
                "padding-left": "13pt"
            });
        }
        treadInput.placeholder = _strings["strValueComment"];
        treadInput.addEventListener("input", function (event) {
            _tread = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(treadTitle, treadDiv);
        KASClient.UI.addElement(treadInput, treadDiv);
    }

    function inflateSpareWheelDiv() {
        var spareWheelDiv = document.getElementById("spareWheelDiv");
        KASClient.UI.clearElement(spareWheelDiv);

        var spareWheelTitle = KASClient.UI.getElement("div");
        spareWheelTitle.className = "question-title";
        spareWheelTitle.innerText = _strings[_form.questions[SPAREWHEEL].title];

        var spareWheelInput = KASClient.UI.getElement("input");
        spareWheelInput.type = "text";
        spareWheelInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(spareWheelInput, {
                "padding-left": "13pt"
            });
        }
        spareWheelInput.placeholder = _strings["strValueComment"];
        spareWheelInput.addEventListener("input", function (event) {
            _spareWheel = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(spareWheelTitle, spareWheelDiv);
        KASClient.UI.addElement(spareWheelInput, spareWheelDiv);
    }

    function inflateJackSpannerDiv() {
        var jackSpannerDiv = document.getElementById("jackSpannerDiv");
        KASClient.UI.clearElement(jackSpannerDiv);

        var jackSpannerTitle = KASClient.UI.getElement("div");
        jackSpannerTitle.className = "question-title";
        jackSpannerTitle.innerText = _strings[_form.questions[JACKSPANNER].title];

        var jackSpannerInput = KASClient.UI.getElement("input");
        jackSpannerInput.type = "text";
        jackSpannerInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(jackSpannerInput, {
                "padding-left": "13pt"
            });
        }
        jackSpannerInput.placeholder = _strings["strValueComment"];
        jackSpannerInput.addEventListener("input", function (event) {
            _jackSpanner = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(jackSpannerTitle, jackSpannerDiv);
        KASClient.UI.addElement(jackSpannerInput, jackSpannerDiv);
    }

    function inflateAidKitDiv() {
        var aidKitDiv = document.getElementById("aidKitDiv");
        KASClient.UI.clearElement(aidKitDiv);

        var aidKitTitle = KASClient.UI.getElement("div");
        aidKitTitle.className = "question-title";
        aidKitTitle.innerText = _strings[_form.questions[AIDKIT].title];

        var aidKitInput = KASClient.UI.getElement("input");
        aidKitInput.type = "text";
        aidKitInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(aidKitInput, {
                "padding-left": "13pt"
            });
        }
        aidKitInput.placeholder = _strings["strValueComment"];
        aidKitInput.addEventListener("input", function (event) {
            _aidKit = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(aidKitTitle, aidKitDiv);
        KASClient.UI.addElement(aidKitInput, aidKitDiv);
    }

    function inflateTrianglesDiv() {
        var trianglesDiv = document.getElementById("trianglesDiv");
        KASClient.UI.clearElement(trianglesDiv);

        var trianglesTitle = KASClient.UI.getElement("div");
        trianglesTitle.className = "question-title";
        trianglesTitle.innerText = _strings[_form.questions[TRIANGLES].title];

        var trianglesInput = KASClient.UI.getElement("input");
        trianglesInput.type = "text";
        trianglesInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(trianglesInput, {
                "padding-left": "13pt"
            });
        }
        trianglesInput.placeholder = _strings["strValueComment"];
        trianglesInput.addEventListener("input", function (event) {
            _triangles = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(trianglesTitle, trianglesDiv);
        KASClient.UI.addElement(trianglesInput, trianglesDiv);
    }

    function inflateExtinguisherDiv() {
        var extinguisherDiv = document.getElementById("extinguisherDiv");
        KASClient.UI.clearElement(extinguisherDiv);

        var extinguisherTitle = KASClient.UI.getElement("div");
        extinguisherTitle.className = "question-title";
        extinguisherTitle.innerText = _strings[_form.questions[EXTINGUISHER].title];

        var extinguisherInput = KASClient.UI.getElement("input");
        extinguisherInput.type = "text";
        extinguisherInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(extinguisherInput, {
                "padding-left": "13pt"
            });
        }
        extinguisherInput.placeholder = _strings["strValueComment"];
        extinguisherInput.addEventListener("input", function (event) {
            _extinguisher = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(extinguisherTitle, extinguisherDiv);
        KASClient.UI.addElement(extinguisherInput, extinguisherDiv);
    }

    function inflateRadioDiv() {
        var radioDiv = document.getElementById("radioDiv");
        KASClient.UI.clearElement(radioDiv);

        var radioTitle = KASClient.UI.getElement("div");
        radioTitle.className = "question-title";
        radioTitle.innerText = _strings[_form.questions[RADIO].title];

        var radioInput = KASClient.UI.getElement("input");
        radioInput.type = "text";
        radioInput.className = "comment-input";

        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(radioInput, {
                "padding-left": "13pt"
            });
        }
        radioInput.placeholder = _strings["strValueComment"];
        radioInput.addEventListener("input", function (event) {
            _radio = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(radioTitle, radioDiv);
        KASClient.UI.addElement(radioInput, radioDiv);
    }

    function inflateQuestions() {

        inflateVehicleRegDiv();

        inflateTripDateDiv();

        inflateOilLevelsDiv();

        inflateRadiatorFluidDiv();

        inflateClutchBrakeFluidDiv();

        inflateFanBeltDiv();

        inflateExhaustPipeDiv();

        inflateFuelTankDiv();

        inflateHeadLightsDiv();

        inflateSideLightsDiv();

        inflateIndicatorLightsDiv();

        inflateReverseLightsDiv();

        inflateWindScreenDiv();

        inflateSideMirrorDiv();

        inflateRearMirrorDiv();

        inflatePressureDiv();

        inflateTreadDiv();

        inflateSpareWheelDiv();

        inflateJackSpannerDiv();

        inflateAidKitDiv();

        inflateTrianglesDiv();

        inflateExtinguisherDiv();

        inflateRadioDiv();

    }

    function inflateDetailsView() {
        // 2nd Page

        var detailsViewDiv = document.getElementById("detailsViewDiv");
        KASClient.UI.clearElement(detailsViewDiv);

        // show details view
        var showDetailsView = KASClient.UI.getElement("div", {
            "display": "block"
        });

        var showDetailsViewName = KASClient.UI.getElement("div");
        showDetailsViewName.className = "section";

        var showDetailsViewNameHeader = KASClient.UI.getElement("p");
        showDetailsViewNameHeader.className = "comment-header";
        showDetailsViewNameHeader.innerText = _strings[_form.questions[NAME].title];

        var showDetailsViewNameInput = KASClient.UI.getElement("input");
        showDetailsViewNameInput.type = "text";
        showDetailsViewNameInput.className = "comment-input";
        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(showDetailsViewNameInput, {
                "padding-left": "13pt"
            });
        }
        showDetailsViewNameInput.placeholder = _strings[_form.questions[NAME].title];
        showDetailsViewNameInput.value = _name;
        showDetailsViewNameInput.addEventListener("input", function (event) {
            _name = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(showDetailsViewNameHeader, showDetailsViewName);
        KASClient.UI.addElement(showDetailsViewNameInput, showDetailsViewName);

        var showDetailsViewPhone = KASClient.UI.getElement("div", {
            "border-bottom": "none"
        });
        showDetailsViewPhone.className = "section";

        var showDetailsViewPhoneHeader = KASClient.UI.getElement("p");
        showDetailsViewPhoneHeader.className = "comment-header";
        showDetailsViewPhoneHeader.innerText = _strings[_form.questions[PHONE_NUMBER].title];

        var showDetailsViewPhoneInput = KASClient.UI.getElement("input", {
            "border-bottom": "none"
        });
        showDetailsViewPhoneInput.type = "tel";
        showDetailsViewPhoneInput.className = "comment-input";
        if (KASClient.getPlatform() == KASClient.Platform.iOS) {
            KASClient.UI.addCSS(showDetailsViewPhoneInput, {
                "padding-left": "13pt"
            });
        }
        showDetailsViewPhoneInput.placeholder = _phoneNumber;
        showDetailsViewPhoneInput.readOnly = true;
        showDetailsViewPhoneInput.addEventListener("input", function (event) {
            _phoneNumber = event.target.value;
            invalidateFooter();
        });

        KASClient.UI.addElement(showDetailsViewPhoneHeader, showDetailsViewPhone);
        KASClient.UI.addElement(showDetailsViewPhoneInput, showDetailsViewPhone);

        KASClient.UI.addElement(showDetailsViewName, showDetailsView);
        KASClient.UI.addElement(showDetailsViewPhone, showDetailsView);

        KASClient.UI.addElement(showDetailsView, detailsViewDiv);
    }

    function inflateLocationView() {
        var locationViewDiv = document.getElementById("locationViewDiv");
        KASClient.UI.clearElement(locationViewDiv);

        // location view header
        var locationHeader = KASClient.UI.getElement("div");
        locationHeader.className = "location-title";
        locationHeader.innerText = _strings[_form.questions[LOCATION].title];

        //location map view
        var locationMapView = KASClient.UI.getElement("img");
        if (_currentLocation.hasOwnProperty("lt") == true && _currentLocation.hasOwnProperty("lg") == true) {
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

        // location address-refresh div
        var locationAddressRefreshDiv = KASClient.UI.getElement("div", {
            "padding": "15pt",
            "padding-top": "8px",
            "display": "inline-flex"
        });

        var locationAddressDiv = KASClient.UI.getElement("div", {
            "float": "left",
            "display": "flex",
            "flex-direction": "column",
            "width": "100%"
        });

        // low network  warning text
        var locationNetworkWarning = KASClient.UI.getElement("label", {
            "color": "#6f7e8f",
            "font-size": "9pt",
            "display": "none"
        });

        // main address text
        var locationAddress = KASClient.UI.getElement("label");
        locationAddress.className = "location-address";

        if (!(_currentLocation.hasOwnProperty("lt") == true && _currentLocation.hasOwnProperty("lg") == true)) {
            if (!_isLocationRefreshing) {
                locationNetworkWarning.style.display = "block";
                locationNetworkWarning.innerText = _strings["strNoLocationAlertLabel"];
            } else {
                locationNetworkWarning.style.display = "none";
                locationAddress.innerText = _strings["strMiniAppLoadingLabel"];
            }
        } else {
            if (_longAddress == "" && _shortAddress == "") {
                locationNetworkWarning.style.display = "block";
                locationAddress.innerText = _currentLocation["lt"] + ", " + _currentLocation["lg"];
                locationNetworkWarning.innerText = _strings["strMiniAppLocationNetworkWarningLabel"];

            } else {

                locationAddress.innerText = _longAddress == "" ? _shortAddress : _longAddress;

            }
        }
        _currentLocation["n"] = locationAddress.innerText;

        KASClient.UI.addElement(locationAddress, locationAddressDiv);
        KASClient.UI.addElement(locationNetworkWarning, locationAddressDiv);

        // refresh button
        var refreshImg = KASClient.UI.getElement("img");
        refreshImg.src = "refresh.png";

        // refresh label
        var refreshLabel = KASClient.UI.getElement("label", {
            "font-size": "9pt",
            "color": "#006ff1",
            "font-weight": "bold"
        });
        refreshLabel.innerText = _strings["strRefreshLabel"];

        var refreshDiv = KASClient.UI.getElement("div", {
            "float": "right",
            "display": "flex",
            "flex-direction": "column",
            "text-align": "right",
            "justify-content": "flex-end",
            "margin-left": "4pt",
            "min-width": "50pt"
        });

        refreshDiv.addEventListener("click", function () {
            refreshLocation();
            inflateLocationView();
        });

        if (!_isLocationRefreshing) {
            refreshLabel.style.display = "block";
            refreshImg.style.display = "none";

            refreshImg.className = "refresh-img";
        } else {
            refreshLabel.style.display = "none";
            refreshImg.style.display = "block";

            refreshImg.className = "refresh-img-selected";
        }

        KASClient.UI.addElement(refreshImg, refreshDiv);
        KASClient.UI.addElement(refreshLabel, refreshDiv);

        KASClient.UI.addElement(locationAddressDiv, locationAddressRefreshDiv);
        KASClient.UI.addElement(refreshDiv, locationAddressRefreshDiv);

        KASClient.UI.addElement(locationHeader, locationViewDiv);
        KASClient.UI.addElement(locationMapView, locationViewDiv);
        KASClient.UI.addElement(locationAddressRefreshDiv, locationViewDiv);

        invalidateFooter();

        if (_currentPage == TOTAL_PAGE) {
            inflateSummaryView();
        }
    }

    function invalidateFooter() {
        inflateFooterView();
    }

    function inflateFooterView() {
        var footer = document.getElementById("footer");
        KASClient.UI.clearElement(footer);

        // setting footer view background
        KASClient.UI.addCSS(footer, {
            "background-image": (_currentPage == TOTAL_PAGE ? "url('footer_bg_3.png')" :
                "url('footer_bg.png')")
        });

        // Previous button
        var prevButton = KASClient.UI.getElement("input");
        prevButton.type = "submit";
        prevButton.className = "footer-action-previous";
        prevButton.value = "";
        prevButton.disabled = (_currentPage == 1);
        if (KASClient.getPlatform() == KASClient.Platform.Android && prevButton.disabled) {
            KASClient.UI.addCSS(prevButton, {
                "border": "1px solid rgba(227, 230, 233, 0.5)"
            });
        }
        prevButton.addEventListener("click", function () {
            _currentPage -= 1;

            if (_currentPage == 1){
                checkRegExists();
            }
            updatePage();
            document.body.scrollTop = 0;
        });

        // Progress view
        var progressDiv = KASClient.UI.getElement("div", {
            "display": "flex",
            "align-items": "center"
        });

        progressDiv.className = "footer-action";

        var progressInnerDiv = KASClient.UI.getElement("div", {
            "width": "100%"
        });

        var progressText = KASClient.UI.getElement("div", {
            "width": "100%",
            "text-align": "center",
            "padding-bottom": "3pt",
            "font-size": "11pt",
            "color": "black",
            "font-weight": "500"
        });

        progressText.innerText = printf(_strings["strProgressTextLabel"], _currentPage, TOTAL_PAGE);

        var progressBarOuterDiv = KASClient.UI.getElement("div", {
            "width": "80%",
            "height": "2pt",
            "background-color": "rgba(152, 163, 175, .25)",
            "margin-left": "10%"
        });

        var progressBarInnerDiv = KASClient.UI.getElement("div", {
            "width": "" + (_currentPage * 100 / TOTAL_PAGE) + "%",
            "height": "100%",
            "background-color": "rgb(253, 158, 40)"
        });

        KASClient.UI.addElement(progressBarInnerDiv, progressBarOuterDiv);

        KASClient.UI.addElement(progressText, progressInnerDiv);
        KASClient.UI.addElement(progressBarOuterDiv, progressInnerDiv);

        KASClient.UI.addElement(progressInnerDiv, progressDiv);

        // Next button
        var nextBgColor = (_currentPage == TOTAL_PAGE ? "#5ad7a4" : "#00a1ff");
        var nextButton = KASClient.UI.getElement("input", {
            "background-color": nextBgColor
        });
        nextButton.type = "submit";
        nextButton.className = (_currentPage == TOTAL_PAGE ? "footer-action-send" : "footer-action-next");
        nextButton.value = (_currentPage == TOTAL_PAGE ? _strings["strSendResponseLabel"] : "");
        var nextButtonIsDisabled = false;
        if (_currentPage == 1) {

            if (_vehicleReg == "" || _tripDate == "" || _oilLevels == "" || _radiatorFluid == "" || _clutchBrakeFluid == "" || _fanBelt == "" || _exhaustPipe == "" || _fuelTank == "") {
                nextButtonIsDisabled = true;
            }
            if (_regExists == false) {
                nextButtonIsDisabled = true;
            }

        } else if (_currentPage == 2) {

            if (_headLights == "" || _sideLights == "" || _indicatorLights == "" || _reverseLights == "") {
                nextButtonIsDisabled = true;
            }
            if (_regExists == false) {
                nextButtonIsDisabled = true;
            }

        } else if (_currentPage == 3) {

            if (_windScreen == "" || _sideMirror == "" || _rearMirror == "") {
                nextButtonIsDisabled = true;
            }
            if (_regExists == false) {
                nextButtonIsDisabled = true;
            }

        } else if (_currentPage == 4) {

            if (_pressure == "" || _tread == "" || _spareWheel == "" || _jackSpanner == "") {
                nextButtonIsDisabled = true;
            }
            if (_regExists == false) {
                nextButtonIsDisabled = true;
            }

        } else if (_currentPage == 5) {

            if (_aidKit == "" || _triangles == "" || _extinguisher == "" || _radio == "") {
                nextButtonIsDisabled = true;
            }
            if (_regExists == false) {
                nextButtonIsDisabled = true;
            }

        } else if (_currentPage == 6) {
            if (_name == "" || _phoneNumber == "") {
                nextButtonIsDisabled = true;
            }
            if (_isLocationRefreshing) {
                nextButtonIsDisabled = true;
            }
            if (_regExists == false) {
                nextButtonIsDisabled = true;
            }

        } else if (_currentPage == 7){
            if (_regExists == false) {
                nextButtonIsDisabled = true;
            }
        }

        nextButton.disabled = nextButtonIsDisabled;
        if (KASClient.getPlatform() == KASClient.Platform.Android && nextButton.disabled) {
            KASClient.UI.addCSS(nextButton, {
                "background-color": "rgb(155, 218, 253)"
            });
        }
        nextButton.addEventListener("click", function () {
            if (_currentPage != TOTAL_PAGE) {
                _currentPage += 1;
                updatePage();
                document.body.scrollTop = 0;
            } else {
                submitFormResponse();
            }
        });

        if (_isTripActive == false) {
            KASClient.UI.addElement(prevButton, footer);
            KASClient.UI.addElement(progressDiv, footer);
            KASClient.UI.addElement(nextButton, footer);
        }
    }

    function inflateSummaryView() {
        var summaryView = document.getElementById("page7");
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

        vehicleReg.innerHTML = _vehicleReg;

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

        tripDate.innerHTML = _tripDate;

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

        oilLevels.innerHTML = _oilLevels;

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

        radiatorFluid.innerHTML = _radiatorFluid;

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

        clutchBrakeFluid.innerHTML = _clutchBrakeFluid;

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

        fanBelt.innerHTML = _fanBelt;

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

        exhaustPipe.innerHTML = _exhaustPipe;

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

        fuelTank.innerHTML = _fuelTank;

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

        headLights.innerHTML = _headLights;

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

        sideLights.innerHTML = _sideLights;

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

        indicatorLights.innerHTML = _indicatorLights;

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

        reverseLights.innerHTML = _reverseLights;

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

        windScreen.innerHTML = _windScreen;

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

        sideMirror.innerHTML = _sideMirror;

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

        rearMirror.innerHTML = _rearMirror;

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

        pressure.innerHTML = _pressure;

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

        tread.innerHTML = _tread;

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

        spareWheel.innerHTML = _spareWheel;

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

        jackSpanner.innerHTML = _jackSpanner;

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

        aidKit.innerHTML = _aidKit;

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

        triangles.innerHTML = _triangles;

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

        extinguisher.innerHTML = _extinguisher;

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

        radio.innerHTML = _radio;

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
        cell12.innerHTML = ": " + _name;

        var row2 = details.insertRow(1);
        var cell21 = row2.insertCell(0);
        var cell22 = row2.insertCell(1);
        cell21.className = "first-column";
        cell21.innerHTML = _strings[_form.questions[PHONE_NUMBER].title];
        cell22.innerHTML = ": " + _phoneNumber;

        KASClient.UI.addElement(details, detailsDiv);

        // Location Summary
        var locationDiv = KASClient.UI.getElement("div", divAttributes);

        var locationHeader = KASClient.UI.getElement("div", {
            "padding": "14px",
            "padding-bottom": "0pt"
        });
        locationHeader.className = "comment-header";
        locationHeader.innerText = _strings[_form.questions[LOCATION].title];
        KASClient.UI.addElement(locationHeader, locationDiv);

        var location = KASClient.UI.getElement("div", {
            "padding-bottom": "14px",
            "padding-top": "14px"
        });

        if (_currentLocation.hasOwnProperty("lt") == true && _currentLocation.hasOwnProperty("lg") == true) {
            var locationMap = KASClient.UI.getElement("img", {
                "width": "100%",
                "height": "auto",
                "max-height": "200pt",
                "padding-bottom": "10pt"
            });
            locationMap.src =
                "https://maps.googleapis.com/maps/api/staticmap?zoom=18&size=360x170&maptype=roadmap&markers=color:blue%7C%7C" +
                _currentLocation["lt"] + "," + _currentLocation["lg"];
            locationMap.onerror = function (e) {
                KASClient.UI.removeElement(locationMap, location);
            }
            KASClient.UI.addElement(locationMap, location);
        }

        var locationName;
        if (_currentLocation["n"] != "") {
            locationName = KASClient.UI.getElement("div", {
                "padding": "14px",
                "padding-top": "0pt",
                "padding-bottom": "0pt",
                "color": "#32485f",
                "font-size": "12pt"
            });

            locationName.innerHTML = _currentLocation["n"];
        } else {
            locationName = KASClient.UI.getElement("div", {
                "padding": "14px",
                "padding-top": "0pt",
                "padding-bottom": "0pt",
                "color": "#6f7e8f",
                "font-size": "9pt"
            });

            locationName.innerHTML = _strings["strNoLocationLabel"];
        }
        KASClient.UI.addElement(locationName, location);

        KASClient.UI.addElement(location, locationDiv);

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
        KASClient.UI.addElement(locationDiv, summaryView);
    }

    // Fetching address from location
    function fetchAndPopulateAddress() {
        if (_currentLocation.hasOwnProperty("lt") == true && _currentLocation.hasOwnProperty("lg") == true) {
            var xhr = new XMLHttpRequest();
            var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + _currentLocation["lt"] + "," +
                _currentLocation["lg"];
            xhr.open("GET", url, true);
            xhr.responseType = "json";
            xhr.timeout = LOCATION_TIMEOUT;
            xhr.onload = function () {
                var status = this.status;
                var response;
                if (status == 200) {
                    try {
                        response = JSON.parse(this.response);
                    } catch (e) {
                        response = this.response;
                    }
                    populateAddress(response["results"][0]);
                }
                _isLocationRefreshing = false;
                inflateLocationView();
            };
            xhr.onerror = function () {
                _isLocationRefreshing = false;
                inflateLocationView();
            }
            xhr.send();
        } else {
            _isLocationRefreshing = false;
            inflateLocationView();
        }
    }

    function populateAddress(address) {
        _longAddress = address["formatted_address"];

        var state = "";
        _district = "";
        _postalCode = "";
        var address_components = address["address_components"];
        for (var component in address_components) {
            var types = address_components[component]["types"];
            for (var type in types) {
                if (types[type] == "administrative_area_level_2") {
                    _district = address_components[component]["long_name"];
                } else if (types[type] == "administrative_area_level_1") {
                    state = address_components[component]["long_name"];
                } else if (types[type] == "postal_code") {
                    _postalCode = address_components[component]["long_name"];
                }
            }
        }

        _shortAddress = "";
        if (_postalCode != "") {
            _shortAddress += _postalCode + ", ";
        }
        if (_district != "") {
            _shortAddress += _district + ", ";
        }
        if (state != "") {
            _shortAddress += state;
        }
    }

    function showError(errorMsg) {
        KASClient.App.showNativeErrorMessage(errorMsg);
    }

    // For debug
    function dismissCurrentScreen() {
        KASClient.App.dismissCurrentScreen();
    };

    // Custom
    function checkRegExists(){
        const url = `${api}company/getVehicleByReg?registration=${_vehicleReg}`;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function (e) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.length > 0) {
                    _regExists = true;
                }
            } else {
                _regExists = false;
                showError("Vehicle registration number doesn't exist.");
            }
        };
        xhr.send(null);
    }