//selectors
const country_name_element = document.querySelector(".country .name");
const total_cases_element = document.querySelector(".total-cases .value");
const new_cases_element = document.querySelector(".total-cases .new-value");
const recovered_element = document.querySelector(".recovered .value");
const new_recovered_element = document.querySelector(".recovered .new-value");
const deaths_element = document.querySelector(".deaths .value");
const new_deaths_element = document.querySelector(".deaths .new-value");

const ctx = document.getElementById("axes_line_chart").getContext("2d");

// data variables
let app_data = [],
    cases_list = [],
    recovered_list = [],
    deaths_list = [],
    deaths = [],
    formatedDates = [];

//api hit to set default user location
fetch("https://api.ipgeolocation.io/ipgeo?apiKey=14c7928d2aef416287e034ee91cd360d")
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        let country_code = data.country_code2;
        let user_country;
        country_list.forEach((country) => {
            if (country.code == country_code) {
                user_country = country.name;
            }
        });
        fetchData(user_country);
    });

//to update data of selected country
function fetchData(country) {
    user_country = country;
    country_name_element.innerHTML = "Loading...";

    (cases_list = []),
        (recovered_list = []),
        (deaths_list = []),
        (dates = []),
        (formatedDates = []);

    var requestOptions = {
        method: "GET",
        redirect: "follow",
    };
        //fetch boilerplate from api documentation
    const api_fetch = async (country) => {
        await fetch(//fetching only confirmed cases
            "https://api.covid19api.com/total/country/" + country + "/status/confirmed",
            requestOptions
        )
            .then((res) => {
                return res.json();//parse response to json
            })
            .then((data) => {
                data.forEach((entry) => {
                    dates.push(entry.Date);
                    cases_list.push(entry.Cases);
                });
            });

        await fetch(//fetching only recovered cases
            "https://api.covid19api.com/total/country/" + country + "/status/recovered",
            requestOptions
        )
            .then((res) => {//parse response to json
                return res.json();
            })
            .then((data) => {
                data.forEach((entry) => {
                    recovered_list.push(entry.Cases);
                });
            });

        await fetch(//fetching only death cases
            "https://api.covid19api.com/total/country/" + country + "/status/deaths",
            requestOptions
        )
            .then((res) => {//parse response to json
                return res.json();
            })
            .then((data) => {
                data.forEach((entry) => {
                    deaths_list.push(entry.Cases);
                });
            });

        updateUI();
    };

    api_fetch(country);
}

// update stats -> first remove existing chart then load another
function updateUI() {
    updateStats();
    axesLinearChart();
}

function updateStats() {
    const total_cases = cases_list[cases_list.length - 1];
    const new_confirmed_cases = total_cases - cases_list[cases_list.length - 2];

    const total_recovered = recovered_list[recovered_list.length - 1];
    const new_recovered_cases = total_recovered - recovered_list[recovered_list.length - 2];

    const total_deaths = deaths_list[deaths_list.length - 1];
    const new_deaths_cases = total_deaths - deaths_list[deaths_list.length - 2];
    
    //setting content inside our html
    country_name_element.innerHTML = user_country;
    total_cases_element.innerHTML = total_cases;
    new_cases_element.innerHTML = `+${new_confirmed_cases}`;
    recovered_element.innerHTML = total_recovered;
    new_recovered_element.innerHTML = `+${new_recovered_cases}`;
    deaths_element.innerHTML = total_deaths;
    new_deaths_element.innerHTML = `+${new_deaths_cases}`;

    // format dates 
    dates.forEach((date) => {
        formatedDates.push(formatDate(date));
    });
}

// update the chart
let my_chart;
function axesLinearChart() {
    //if we already have a chart, first remove it before loading another
    if (my_chart) {
        my_chart.destroy();
    }

    my_chart = new Chart(ctx, {
        //boikerplate from chart.js website
        type: "line",
        data: {
            datasets: [
                {
                    label: "Cases",
                    data: cases_list,
                    fill: false,
                    borderColor: "#FFF",
                    backgroundColor: "rgba(255,255,255,0.35)",
                    borderWidth: 0.2,
                },
                {
                    label: "Recovered",
                    data: recovered_list,
                    fill: false,
                    borderColor: "#00ff2e",
                    backgroundColor: "rgba(10,255,0,0.37)",
                    borderWidth: 0.2,
                    borderDash: [5, 5],
                },
                {
                    label: "Deaths",
                    data: deaths_list,
                    fill: false,
                    borderColor: "#ff1000",
                    backgroundColor: "rgba(255,15,0,0.77)",
                    borderWidth: 0.2,
                },
            ],
            labels: formatedDates,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}

// to reformat dates into month and date
const monthsNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function formatDate(dateString) {
    let date = new Date(dateString);

    return `${date.getDate()} ${monthsNames[date.getMonth()]}`;
}
