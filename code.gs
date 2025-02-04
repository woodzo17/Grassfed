// Code.gs

const API_KEY = 'GRASSFEDBROKERSOLUTIONS-cbdf-7ade-ab41-773002d8c382';
const API_URL = "https://api.realestateapi.com/v2/PropertySearch";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle("Grassfed Property Count Lookup");
}

function getPropertyCount(formData) {
  if (!formData || !formData.zipCodes) {
    throw new Error("No zip codes provided.");
  }
  
  // Process zip codes: split by commas (allowing extra whitespace) and remove stray quotes.
  var zipCodes = formData.zipCodes.split(/\s*,\s*/).map(function(zip) {
    return zip.replace(/"/g, '');
  }).filter(function(zip) {
    return zip.length > 0;
  });
  
  Logger.log("Zip Codes Array: " + JSON.stringify(zipCodes));
  
  // Get state from formData (default to "ME" if not provided)
  var state = formData.state ? formData.state.trim().toUpperCase() : "ME";
  
  // Build the payload using the provided zip codes, state, and filters.
  var payloadObj = {
    count: true,
    ids_only: false,
    summary: false,
    size: 50,
    resultIndex: 0,
    state: state,
    zip: zipCodes
  };

  // Financial Distress Filters
  if (formData.high_equity) payloadObj.high_equity = true;
  if (formData.tax_lien) payloadObj.tax_lien = true;
  if (formData.foreclosure) payloadObj.foreclosure = true;
  if (formData.pre_foreclosure) payloadObj.pre_foreclosure = true;
  if (formData.ltv_max) payloadObj.ltv_max = Number(formData.ltv_max);

  // Life Changes Filters
  if (formData.absentee_owner) payloadObj.absentee_owner = true;
  if (formData.inherited) payloadObj.inherited = true;
  if (formData.out_of_state_owner) payloadObj.out_of_state_owner = true;

  // Property Condition Filters
  if (formData.vacant) payloadObj.vacant = true;
  if (formData.value_min) payloadObj.value_min = Number(formData.value_min);
  if (formData.value_max) payloadObj.value_max = Number(formData.value_max);

  // Market Activity Filters
  if (formData.mls_days_on_market_min) payloadObj.mls_days_on_market_min = Number(formData.mls_days_on_market_min);
  if (formData.mls_listing_price) payloadObj.mls_listing_price = Number(formData.mls_listing_price);
  if (formData.mls_listing_price_operator) payloadObj.mls_listing_price_operator = formData.mls_listing_price_operator;

  // Motivated Seller Filters
  if (formData.death) payloadObj.death = true;
  if (formData.auction) payloadObj.auction = true;
  if (formData.reo) payloadObj.reo = true;
  if (formData.judgment) payloadObj.judgment = true;
  if (formData.quit_claim) payloadObj.quit_claim = true;

  Logger.log("Payload: " + JSON.stringify(payloadObj));
  
  var params = {
    method: "post",
    contentType: "application/json",
    headers: { "x-api-key": API_KEY },
    payload: JSON.stringify(payloadObj)
  };

  try {
    var response = UrlFetchApp.fetch(API_URL, params);
    var json = JSON.parse(response.getContentText());
    Logger.log("API Response: " + JSON.stringify(json));
    
    var count = json.count || json.totalResults || (json.meta && json.meta.count) || json.resultCount || 0;
    return count;
  } catch (e) {
    Logger.log("Error fetching data: " + e.toString());
    throw new Error("Failed to fetch property count. Please try again later.");
  }
}
