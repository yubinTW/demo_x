
describe("My Event Page", () => {
    beforeEach(() => {
    
        
    })
    afterEach(() => {
    })

    it("show my event from our server", () => {
        cy.visit('/my-event')
        cy.get('div#event-tab')
    })
})