const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");
const outputCSSPath = path.join(OUTPUT_DIR, "style.css");

const render = require("./lib/htmlRenderer");
const Employee = require("./lib/Employee");


// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)

// function to validate questions that can't be blank
const cannotBeBlank = async(input) => {
    if (input === "") {
       return "You must supply a value";
    }
    return true;
 };

// function to validate questions that must be numeric and not blank
const mustBeNumeric = async(input) => {
    if (parseInt(input) != input) {
       return "You must supply a numeric value";
    }
    return true;
 };

 // function to validate email address is correct format (but can be blank)
const isEmailAddress = async(input) => {
    if (!input.includes(`@`) && (input != '' && input != null)) {
       return "Please supply a valid email address";
    }
    return true;
 };

//array of questions
const self = [
    { 
        type: "input",
        message: "What is your name?",
        name: "managerName",
        validate: cannotBeBlank
    },
    { 
        type: "input",
        message: "What is your id?",
        name: "managerId",
        validate: mustBeNumeric
    },
    { 
        type: "input",
        message: "What is your email address?",
        name: "managerEmail",
        validate: isEmailAddress
    },
    { 
        type: "input",
        message: "What is your office number?",
        name: "managerOfficeNumber"
    }
]

// HINT: each employee type (manager, engineer, or intern) has slightly different
// information; write your code to ask different questions via inquirer depending on
// employee type.

const questions = [
    {
        type: "list",
        message: "What type of employee would you like to add?",
        name: "empType",
        choices: [
            "Engineer", 
            "Intern", 
        ],
        validate: cannotBeBlank
    },
    { 
        type: "input",
        message: "What is their name?",
        name: "empName",
        validate: cannotBeBlank
    },
    { 
        type: "input",
        message: "What is their id?",
        name: "empId",
        validate: mustBeNumeric
    },
    { 
        type: "input",
        message: "What is their email address?",
        name: "empEmail",
        validate: isEmailAddress
    },
    { 
        type: "input",
        message: "What is their GitHub user name?",
        name: "empEngGitHub",
        when: (answers) => answers.empType === 'Engineer'
    },
    { 
        type: "input",
        message: "What school do they attend?",
        name: "empInternSchool",
        when: (answers) => answers.empType === 'Intern'
    },
    {
        type: "confirm",
        name: "moreEmployees",
        message: "Do you need to enter anymore employees?",
        default: true
    }
]

// declare array that will hold manager and employee responses assigned to classes
let employees = [];

// function to ask manager questions (self)
function initManager() {
    inquirer
    .prompt(self)
      .then(response => {
        // set responses to Manager object and push to employees array
        const manager = new Manager(response.managerName, response.managerId, response.managerEmail, response.managerOfficeNumber);
        employees.push(manager);
        // call function to ask employee (Engineer/Intern) questions
        initEmployee();
    });
}

//variable set that will eventually be used to determine if employee questions should repeat (based on prompt)
let repeat = true;

// function to ask employee questions (engineer/intern)
function initEmployee() {
    // if repeat is true
    if (repeat) {
        inquirer
        .prompt(questions)
          .then(response => {
            // if Engineer, set responses to Engineer object and push to employees array
            if (response.empType === "Engineer") {
                
                const engineer = new Engineer(response.empName, response.empId, response.empEmail, response.empEngGitHub);
                employees.push(engineer);

            // if Intern, set responses to Intern object and push to employees array
            } else if (response.empType === "Intern") {

                const intern = new Intern(response.empName, response.empId, response.empEmail, response.empInternSchool);
                employees.push(intern);
            }

            repeat = response.moreEmployees;
            initEmployee();
          })
    } else {
        //console.log(employees);
        // once manager is finished answering questions, write to team.html file to render web page
        createWebPage();
    }
}

// After the user has input all employees desired, call the `render` function (required
// above) and pass in an array containing all employee objects; the `render` function will
// generate and return a block of HTML including templated divs for each employee!
function createWebPage() {

    const webPage = render(employees);
    // After you have your html, you're now ready to create an HTML file using the HTML
    // returned from the `render` function. Now write it to a file named `team.html` in the
    // `output` folder. You can use the variable `outputPath` above target this location.
    // Hint: you may need to check if the `output` folder exists and create it if it does not.
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }

    // if (!fs.existsSync(outputCSSPath)) {
        fs.copyFileSync("./templates/style.css", outputCSSPath);
    // }

    fs.writeFileSync(outputPath, webPage, err => {
        if (err) {
            console.log(err);
        }
    });
}

// call function to initialize program
initManager();
