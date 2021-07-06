
describe("Summary Page", () => {
    beforeEach(() => {
    
        
    })
    afterEach(() => {
    })

    it("show Product Suite List from our server", () => {
        cy.visit('/summary-board')
        cy.get('select#psSelect').select('GigaCIM')
        cy.wait(1000)
    })
    it("show Product List from our server", () => {
        cy.visit('/summary-board')
        cy.get('select#psSelect').select('GigaCIM').get('select#productSelect').select('SiMM')
        cy.wait(1000)
    })
})