
describe("My Event Page", () => {
    beforeEach(() => {
        cy.visit('/my-event')
        
    })
    afterEach(() => {
    })

    it("Show My Event Tab and Authorization Tab", () => {
        
        //cy.get('div#event-tab')
        //cy.get('#event-tab')
        cy.get('ul[class*=p-tabview-nav]').get('li').first().next().click()
        cy.wait(1000)
        cy.get('ul[class*=p-tabview-nav]').get('li').first().click()
        cy.wait(1000)
    })
    it("Check My Event List subscriber", () => {
        cy.get('ul[class*=p-tabview-nav]').get('li').first().click()
        //cy.get('ul[class*=p-tabview-nav]').get('li').first().get('tbody').get('tr').first().get('td').first().should('have.text','GigaCIM.SiMM.Lot.LotHold.AMFH')
        cy.get('ul[class*=p-tabview-nav]').get('li').first().get('button[class*=warning]').first().click()
        cy.wait(1000)
        cy.get('div[class*=p-dialog-footer]').get('button[class*=p-button]').get('span[class*=pi-check]').click()
    })
    it("Check My Event List View API", () => {
        cy.get('ul[class*=p-tabview-nav]').get('li').first().click()

        cy.get('ul[class*=p-tabview-nav]').get('li').first().get('button[class*=p-button-primary]').get('svg[data-icon*=external-link-alt]').first().click()
        cy.wait(3000)
    })
    it("Go to My Authorzation List and View API", () => {
        cy.get('ul[class*=p-tabview-nav]').get('li').first().next().click()
        cy.wait(1000)
        cy.get('button[class*=p-button-primary]').get('svg[data-icon*=external-link-alt]').first().click()
        cy.wait(3000)
    })
})