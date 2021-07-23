
describe("Summary Page", () => {
    beforeEach(() => {
        cy.visit('/summary-board')
        
    })
    afterEach(() => {
    })
    it("Check Sidebar", () => {
        cy.get('div[class*=nav-item]').get('a[href="/"][class*=nav-link]').contains('Product X')
        cy.get('div[class*=nav-item]').get('a[href="/summary-board"][class*=nav-link]').contains('Summary')
        cy.get('div[class*=nav-item]').get('a[href="/my-event"][class*=nav-link]').contains('My Events')
    })
    it("Show Product Suite List from our server", () => {
        cy.get('select#psSelect').select('GigaCIM')
        cy.wait(1000)
    })
    it("Show Product List from our server", () => {
        cy.get('select#psSelect').select('GigaCIM').get('select#productSelect').select('SiMM')
        cy.wait(1000)
    })
    it("Test Searching", () => {
        cy.get('input[placeholder*=Search]').type('Testing')

    })
})