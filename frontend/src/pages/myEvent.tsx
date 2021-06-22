import React, { useState, useEffect } from 'react'

import 'primeicons/primeicons.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'
import '../assets/css/datatable.css'
import { Form, InputGroup } from '@themesberg/react-bootstrap'
// import { Dropdown } from 'primereact/dropdown'
// import { PreworkService } from './../service/preworkService'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListAlt } from '@fortawesome/free-solid-svg-icons'
import { SourceMap } from 'module'
import { NodeService } from './../service/NodeService'
import * as TE from 'fp-ts/TaskEither'
import { zero } from 'fp-ts/Array'
import { EventBody } from '../service/serviceObject'
function MyEventPage() {
  const [displayBasic, setDisplayBasic] = useState(false)
  const nodeService = new NodeService()

  useEffect(() => {
    TE.match<Error, EventBody, EventBody>(
      (e) => {
        console.error(`Get My Event Data Error: ${e}`)
        return {} as EventBody
      },
      (r) => {
        console.log(r)
        return r
      }
    )(nodeService.getMyEventData())()
  }, [])
  const eventList = [
    {
      title: 'GigaCIM.SiMM.Lot.LotHold.AMFH',
      aapiOwner: 'LCLIAOB',
      description: 'test test test',
      productSuite: 'GigaCIM',
      product: 'SiMM',
    },
    {
      title: 'GigaCIM.SiMM.Lot.LotHold.AOAH',
      aapiOwner: 'LCLIAOB',
      description: 'test test test',
      productSuite: 'GigaCIM',
      product: 'SiMM',
    },
    {
      title: 'GigaCIM.SiMM.Lot.LotHold.AUTO',
      aapiOwner: 'LCLIAOB',
      description: 'test test test',
      productSuite: 'GigaCIM',
      product: 'SiMM',
    },
    {
      title: 'FAB.testN.Lot.LotHold.JJJJ',
      aapiOwner: 'LCLIAOB',
      description: 'test test test',
      productSuite: 'FAB',
      product: 'testN',
    },
  ]
  const sList = ['susciber1', 'susciber2', 'susciber3', 'susciber4', 'susciber5', 'susciber6']
  const viewSubscriberTemplate = (rowData) => {
    return (
      <Button className="p-button-primary p-button-sm" onClick={() => onClick()}>
        <FontAwesomeIcon icon={faListAlt} className="d-none d-md-inline ms-0" />
      </Button>
    )
  }
  const onHide = () => {
    setDisplayBasic(false)
  }
  const onClick = () => {
    setDisplayBasic(true)
  }
  const renderFooter = () => {
    return (
      <div>
        <Button label="Close" icon="pi pi-check" onClick={() => onHide()} autoFocus />
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-md-0">
          <h4>My Event List</h4>
          <p className="mb-0">show all events you have authorization to review subscribers</p>
        </div>
      </div>
      <div className="p-grid">
        <div className="p-col-6"></div>
        <div className="p-offset-3 p-col-3">
          <Form.Group id="pd-filter">
            {/* <Form.Label>Event Subject Search</Form.Label> */}
            <InputGroup>
              <InputGroup.Text>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroup.Text>
              <Form.Control type="text" placeholder="Search" />
            </InputGroup>
          </Form.Group>
        </div>
      </div>

      <div className="card mt-2">
        <DataTable value={eventList} className="datatable-class" paginator>
          <Column field="title" header="Event Subject"></Column>
          <Column field="description" header="Description"></Column>
          <Column field="aapiOwner" header="Owner"></Column>
          <Column field="subsriber" header="View Subscibers" body={viewSubscriberTemplate}></Column>
        </DataTable>
      </div>
      <Dialog
        header="Suscriber List"
        visible={displayBasic}
        style={{ width: '50vw' }}
        footer={renderFooter()}
        onHide={() => onHide()}
      >
        <ul>
          {sList.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
      </Dialog>
    </div>
  )
}

export default MyEventPage
