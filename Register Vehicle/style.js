// Type aliases (short names)
var printf = KASClient.App.printf;

var _form; // type: KASForm

var _vehicleReg = "";
var _comments = "";
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

// constants
var TOTAL_PAGE = 3;
var LOCATION_TIMEOUT = 10000;

// Question index
var VEHICLEREG = 0;
var COMMENTS = 1;
var NAME = 2;
var PHONE_NUMBER = 3;
var LOCATION = 4;
var TIME = 5;

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
    questionToAnswerMap[COMMENTS] = _comments;
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

    if (_currentPage == 2 && _isLocationNotFetched) {
        _isLocationNotFetched = false;
        refreshLocation();
        inflateLocationView();
    }
    if (_currentPage == TOTAL_PAGE) {

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

function inflateCommentsDiv() {
    var commentsDiv = document.getElementById("commentsDiv");
    KASClient.UI.clearElement(commentsDiv);

    var commentsTitle = KASClient.UI.getElement("div");
    commentsTitle.className = "question-title";
    commentsTitle.innerText = _strings[_form.questions[COMMENTS].title];

    var commentsInput = KASClient.UI.getElement("input");
    commentsInput.type = "text";
    commentsInput.className = "comment-input";

    if (KASClient.getPlatform() == KASClient.Platform.iOS) {
        KASClient.UI.addCSS(commentsInput, {
            "padding-left": "13pt"
        });
    }
    commentsInput.placeholder = _strings["strTapToEnter"];
    commentsInput.addEventListener("input", function (event) {
        _comments = event.target.value;
        invalidateFooter();
    });

    KASClient.UI.addElement(commentsTitle, commentsDiv);
    KASClient.UI.addElement(commentsInput, commentsDiv);
}

function inflateQuestions() {
    inflateVehicleRegDiv();

    inflateCommentsDiv();
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

        if (_vehicleReg == "") {
            nextButtonIsDisabled = true;
        }

    } else if (_currentPage == 2) {
        if (_name == "" || _phoneNumber == "") {
            nextButtonIsDisabled = true;
        }
        if (_isLocationRefreshing) {
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

    KASClient.UI.addElement(prevButton, footer);
    KASClient.UI.addElement(progressDiv, footer);
    KASClient.UI.addElement(nextButton, footer);
}

function inflateSummaryView() {
    var summaryView = document.getElementById("page3");
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

    // comments

    var commentsDetailsDiv = KASClient.UI.getElement("div", divAttributes);

    var commentsDetailsHeader = KASClient.UI.getElement("div", {
        "padding": "14px",
        "padding-bottom": "0pt"
    });

    commentsDetailsHeader.className = "comment-header";
    commentsDetailsHeader.innerText = _strings[_form.questions[COMMENTS].title];
    KASClient.UI.addElement(commentsDetailsHeader, commentsDetailsDiv);

    var commentsDetailsView = KASClient.UI.getElement("div", {
        "padding": "14px",
        "padding-top": "5pt"
    });

    var comments = KASClient.UI.getElement("div", {
        "color": "#32485f",
        "font-size": "12pt",
        "overflow-wrap": "break-word",
        "word-wrap": "break-word",
        "word-break": "break-word"
    });

    comments.innerHTML = _comments;

    KASClient.UI.addElement(comments, commentsDetailsView);
    KASClient.UI.addElement(commentsDetailsView, commentsDetailsDiv);

    // end elements

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
    KASClient.UI.addElement(commentsDetailsDiv, summaryView);
    KASClient.UI.addElement(detailsDiv, summaryView);
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