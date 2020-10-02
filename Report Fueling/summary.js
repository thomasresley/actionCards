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
var FUELSTATION = 1;
var LITRES = 2;
var COST = 3;
var COMMENTS = 4;
var NAME = 5;
var PHONE_NUMBER = 6;
var LOCATION = 7;
var TIME = 8;

var _postalCode = "";
var _district = "";
var _longAddress = "";
var _shortAddress = "";

function inflateHeader() {
  var header = document.getElementById("header");
  KASClient.UI.clearElement(header);

  var navigationBar = new KASClient.UI.KASFormPageNavigationBar();

  navigationBar.iconPath = "download.png";

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
  errorPage.navigationBar.iconPath = "download.png";
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

  // fuelStation

  var fuelStationDetailsDiv = KASClient.UI.getElement("div", divAttributes);

  var fuelStationDetailsHeader = KASClient.UI.getElement("div", {
      "padding": "14px",
      "padding-bottom": "0pt"
  });

  fuelStationDetailsHeader.className = "comment-header";
  fuelStationDetailsHeader.innerText = _strings[_form.questions[FUELSTATION].title];
  KASClient.UI.addElement(fuelStationDetailsHeader, fuelStationDetailsDiv);

  var fuelStationDetailsView = KASClient.UI.getElement("div", {
      "padding": "14px",
      "padding-top": "5pt"
  });

  var fuelStation = KASClient.UI.getElement("div", {
      "color": "#32485f",
      "font-size": "12pt",
      "overflow-wrap": "break-word",
      "word-wrap": "break-word",
      "word-break": "break-word"
  });

  fuelStation.innerHTML = _strings[_form.questions[FUELSTATION].options[_myFormResponses.questionToAnswerMap[FUELSTATION]].text];

  KASClient.UI.addElement(fuelStation, fuelStationDetailsView);
  KASClient.UI.addElement(fuelStationDetailsView, fuelStationDetailsDiv);

  // litres

  var litresDetailsDiv = KASClient.UI.getElement("div", divAttributes);

  var litresDetailsHeader = KASClient.UI.getElement("div", {
      "padding": "14px",
      "padding-bottom": "0pt"
  });

  litresDetailsHeader.className = "comment-header";
  litresDetailsHeader.innerText = _strings[_form.questions[LITRES].title];
  KASClient.UI.addElement(litresDetailsHeader, litresDetailsDiv);

  var litresDetailsView = KASClient.UI.getElement("div", {
      "padding": "14px",
      "padding-top": "5pt"
  });

  var litres = KASClient.UI.getElement("div", {
      "color": "#32485f",
      "font-size": "12pt",
      "overflow-wrap": "break-word",
      "word-wrap": "break-word",
      "word-break": "break-word"
  });

  litres.innerHTML = _myFormResponses.questionToAnswerMap[LITRES];

  KASClient.UI.addElement(litres, litresDetailsView);
  KASClient.UI.addElement(litresDetailsView, litresDetailsDiv);

  // cost

  var costDetailsDiv = KASClient.UI.getElement("div", divAttributes);

  var costDetailsHeader = KASClient.UI.getElement("div", {
      "padding": "14px",
      "padding-bottom": "0pt"
  });

  costDetailsHeader.className = "comment-header";
  costDetailsHeader.innerText = _strings[_form.questions[COST].title];
  KASClient.UI.addElement(costDetailsHeader, costDetailsDiv);

  var costDetailsView = KASClient.UI.getElement("div", {
      "padding": "14px",
      "padding-top": "5pt"
  });

  var cost = KASClient.UI.getElement("div", {
      "color": "#32485f",
      "font-size": "12pt",
      "overflow-wrap": "break-word",
      "word-wrap": "break-word",
      "word-break": "break-word"
  });

  cost.innerHTML = _myFormResponses.questionToAnswerMap[COST];

  KASClient.UI.addElement(cost, costDetailsView);
  KASClient.UI.addElement(costDetailsView, costDetailsDiv);

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

  comments.innerHTML = _myFormResponses.questionToAnswerMap[COMMENTS];

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
  KASClient.UI.addElement(fuelStationDetailsDiv, summaryView);
  KASClient.UI.addElement(litresDetailsDiv, summaryView);
  KASClient.UI.addElement(costDetailsDiv, summaryView);
  KASClient.UI.addElement(commentsDetailsDiv, summaryView);
  KASClient.UI.addElement(detailsDiv, summaryView);

  KASClient.UI.addElement(locationDetailsDiv, summaryView);

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