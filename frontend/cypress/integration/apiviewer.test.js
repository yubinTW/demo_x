
describe("Api Viewer Test", () => {
    beforeEach(() => {
        cy.visit('/api-viewer/testid-lcliaob')
        
    })
    afterEach(() => {
    })
    it("Check Api Name", () => {
        cy.get('h1').contains('test_api_name')
    })
    it("Check info", ()=>{
        cy.get('p').contains('API Owner')
        cy.get('p').contains('LCLIAOB')
        cy.get('small').contains('Created Time')
        cy.get('small').contains('Updated Time')
    })
    
})