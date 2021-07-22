
describe("Home Page Test", () => {
    beforeEach(() => {
        cy.visit('/')
        
    })
    afterEach(() => {
    })

    it("Product X Link", () => {
        cy.get('a[href*="/#home"]').get('span').should('have.text','Product X')
    })
    it("Summary Link", () => {
        cy.get('a[href*="/summary-board"][class*=nav-link]').should('have.text','Summary')
    })
    it("Dashboard Link", () => {
        cy.get('a[href*="/my-event"][class*=nav-link]').should('have.text','Dashboard')
    })
    it("Go to Platform Link", () => {
        cy.get('a[href*="/my-event"][class*=btn]').contains('Go to Platform')
    })
    it("document Link", () => {
        cy.get('button[class*=me-3]').contains('document')
    })
    it("H1 test", () => {
        cy.get('h1').contains('Event Driven Data Platform')
    })
    it("h3 test", () => {
        cy.get('h3[class*=fw-bolder]').contains('NATS')
        cy.get('h3[class*=fw-bolder]').contains('MERN')
        cy.get('h3[class*=fw-bolder]').contains('Workflow')
        cy.get('h3[class*=fw-bolder]').contains('Bootstrap 5')
    })
})