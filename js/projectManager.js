/*jshint esversion: 6 */

class ProjectManager {

    constructor() {

        // Create Model object for calculations
        //this.model = new DSS_model();

        // TEMP initialise problem - later remove for local storage check below
        // this.initialiseProject();

        // // IF localStorage present, load storage, otherwise intialise problem
        if (localStorage.getItem('riskAnalysisData') != null) {
            this.loadLocal();
        } else {
            // Create and initialise new data objects
            this.initialiseProject();
        }
    }

    // Create new data object and initialise
    initialiseProject() {
        // Clear local storage
        this.clearLocal();
        // Create empty copy of Problem data object and set this.project to it
        this.setBlankProject("TEST PROJECT NAME 2");
        // Save blank project to local storage
        this.saveLocal();
    }

    // Create blank project and set this.project
    setBlankProject(projectName) {
        // Create blank project (deep copy clone) and name
        this.project = null;
        this.project = JSON.parse(JSON.stringify(Project));
        this.project.name = projectName;
        // Add single category
        this.addCategory("TEST CATEGORY");
    }
    // Return project data object
    getProject() {
        return this.project;
    }
    // Add cetegory with categoryName
    addCategory(categoryName) {
        // Create blank category (deep copy clone) and name
        let newCat = JSON.parse(JSON.stringify(Category));
        newCat.name = categoryName;
        // Push category to array and capture index
        let catSize = this.project.categories.push(newCat);
        // Add single Risk with weight = 100 (as new category need single Risk)
        let cat = this.getCategory(catSize-1);
        this.addRiskTo(cat, "TEST RISK", 100);
        // Return added category
        return cat;
    }
    // Remove last category
    removeCategory() {
        this.project.categories.pop();
    }
    // Return length of Categories array
    getCategoryLength() {
        return this.project.categories.length;
    }
    // Return category of ID
    getCategory(id) {
        return this.project.categories[id];
    }

    // Add risk to categoru with riskName and riskWeight
    addRiskTo(category, riskName, riskWeight) {
        // Create blank risk (deep copy clone), name and set weight
        let newRisk = JSON.parse(JSON.stringify(Risk));
        newRisk.name = riskName;
        newRisk.weight = riskWeight;
        // Push to risk array of selected category
        let risksSize = category.risks.push(newRisk);
        // Return added risk
        return category.risks[risksSize-1];
    }
    // Remove last risk from category
    removeRiskFrom(category) {
        category.risks.pop();
    }

    // SAVE FUNCTIONS

    // Save project data object to local storage (as JSON)
    saveLocal() {
        localStorage.setObject('riskAnalysisData', this.project);
    }

    // IF data stored - Load project data object from local storage (convert from JSON)
    loadLocal() {
        this.project = localStorage.getObject('riskAnalysisData');
        // check for null categories project
        if (this.project.categories == null) {
            // Clear locaStorage and load test project

            this.initialiseProject();
        }
    }

    // Clear local Storage
    clearLocal() {
        localStorage.setObject('riskAnalysisData', null);

    }

    // Reset project and clear all current data from memory and local Storage
    resetProject() {
        this.initialiseProject();
    }

    // Load example project
    loadExample() {
        this.clearLocal();
        this.loadExampleProject();
        this.saveLocal();
    }



    ////////////////// TESTING //////////////////////
    // load test problem
    loadExampleProject() {
        // Create blank project (deep copy clone) and name
        this.project = null;
        this.project = JSON.parse(JSON.stringify(Project));
        this.project.name = "Example Project";
        this.project.cost = 600000;

        let cat1 = this.addCategory("Financial");

        let risk1 = cat1.risks[0];
        risk1.name = "Deposition of surplus earth work";
        risk1.weight = 50;
        risk1.occurrence = 25;
        risk1.coefficient = 30;
        risk1.controllability = 30;
        risk1.dependency = 90;
        risk1.costImpact = [80,10,0];
        risk1.durationImpact = [0,10,0];
        risk1.qualityImpact = [0,0,0];

        let risk2 = this.addRiskTo(cat1, "Program delivery", 10);
        risk2.occurrence = 10;
        risk2.coefficient = 100;
        risk2.controllability = 30;
        risk2.dependency = 50;
        risk2.costImpact = [10,50,30];
        risk2.durationImpact = [10,50,30];
        risk2.qualityImpact = [0,0,0];

        let risk3 = this.addRiskTo(cat1, "Design growth", 20);
        risk3.occurrence = 70;
        risk3.coefficient = 100;
        risk3.controllability = 100;
        risk3.dependency = 100;
        risk3.costImpact = [80,10,10];
        risk3.durationImpact = [80,10,10];
        risk3.qualityImpact = [0,0,0];

        let risk4 = this.addRiskTo(cat1, "Sub-contractor pricing", 20);
        risk4.occurrence = 30;
        risk4.coefficient = 50;
        risk4.controllability = 30;
        risk4.dependency = 100;
        risk4.costImpact = [20,20,10];
        risk4.durationImpact = [0,0,0];
        risk4.qualityImpact = [0,0,0];

        let cat2 = this.addCategory("Technical & Operational");

        let cat3 = this.addCategory("Managerial & Legal");

        let cat4 = this.addCategory("Environmental & Social");

        let cat5 = this.addCategory("Health, Safety & Other");



    }

}
