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
import { TabView, TabPanel } from 'primereact/tabview'
import { faListAlt, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { SourceMap } from 'module'
import { NodeService } from './../service/NodeService'
import * as TE from 'fp-ts/TaskEither'
import { zero } from 'fp-ts/Array'
import { AapiBody, EventBody ,SubscriberBody} from '../service/serviceObject'
function MyEventPage() {
  const [displayBasic, setDisplayBasic] = useState(false)
  const [eventOwnerPage, setEventOwnerPage] = useState<Array<AapiBody>>([])
  const [subscriberList, setSubscriberList] = useState<Array<SubscriberBody>>([])
  const [eventSubscriberPage, setEventSubscriberPage] = useState<Array<AapiBody>>([])
  const nodeService = new NodeService()

  async function setUpData() {
    const data = await TE.match<Error, EventBody, EventBody>(
      (e) => {
        console.error(`Get My Event Data Error: ${e}`)
        return {} as EventBody
      },
      (r) => {
        //console.log(r)
        if ('own' in r && 'subscribe' in r) {
          setEventOwnerPage(r.own)
          setEventSubscriberPage(r.subscribe)
        } else {
          console.error('Get data error')
        }
        return r
      }
    )(nodeService.getMyEventData())()
  }
  useEffect(() => {
    setUpData()
  }, [])

  //const sList = ['susciber1', 'susciber2', 'susciber3', 'susciber4', 'susciber5', 'susciber6']
  const viewSubscriberTemplate = (rowData) => {
    //console.log(rowData)
    return (
      <Button
        className="p-button-primary p-button-sm"
        onClick={() => onClick(rowData['subscribers'])}
      >
        <FontAwesomeIcon icon={faListAlt} className="d-none d-md-inline ms-0" />
      </Button>
    )
  }
  const redirectAPI = (apiId: string) => {
    const npath = '/api-viewer/'
    const pathconcat = npath.concat(apiId)
    // window.location.pathname = pathconcat
    window.open(pathconcat, '_blank')
  }
  const viewAPITemplate = (rowData) => {
    //console.log(rowData)
    return (
      <Button className="p-button-primary p-button-sm" onClick={() => redirectAPI(rowData['id'])}>
        <FontAwesomeIcon icon={faExternalLinkAlt} className="d-none d-md-inline ms-0 p-mr-1" /> view
        API
      </Button>
    )
  }
  const onHide = () => {
    setDisplayBasic(false)
  }
  const onClick = (subList: Array<SubscriberBody>) => {
    setDisplayBasic(true)
    if (subList !== undefined) {
      setSubscriberList(subList)
    }
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
      <TabView>
        <TabPanel header="My Event List">
          {/* <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
          <div className="d-block mb-4 mb-md-0">
          
            
            <p className="mb-0">show all events you have authorization to review subscribers</p>
          </div>
        </div> */}
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
            <DataTable value={eventOwnerPage} className="datatable-class" paginator>
              <Column field="title" header="Event Subject"></Column>
              <Column field="description" header="Description"></Column>
              <Column field="aapiOwner" header="Owner"></Column>
              <Column
                field="subsriber"
                header="View Subscibers"
                body={viewSubscriberTemplate}
              ></Column>
            </DataTable>
          </div>
          <Dialog
            header="Subscriber List"
            visible={displayBasic}
            style={{ width: '50vw' }}
            footer={renderFooter()}
            onHide={() => onHide()}
          >
            <ul>
              {subscriberList.map((item) => (
                <li key={item.name}>{item.name}</li>
              ))}
            </ul>
          </Dialog>
        </TabPanel>
        <TabPanel header="My Subscribe List">
          {/* <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
          <div className="d-block mb-4 mb-md-0">
          
            
            <p className="mb-0">show all events you have authorization to review subscribers</p>
          </div>
        </div> */}
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
            <DataTable value={eventSubscriberPage} className="datatable-class" paginator>
              <Column field="title" header="Event Subject"></Column>
              <Column field="description" header="Description"></Column>
              <Column field="aapiOwner" header="Owner"></Column>
              <Column field="api_infos" header="View API Document" body={viewAPITemplate}></Column>
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    </div>
  )
}

export default MyEventPage
