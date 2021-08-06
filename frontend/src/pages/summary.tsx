import React, { useState, useEffect, useRef } from 'react'

import 'primeicons/primeicons.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'
import '../assets/css/datatable.css'
import { Form, InputGroup } from '@themesberg/react-bootstrap'
import { PreworkService } from './../service/preworkService'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NodeService } from '../service/NodeService'
import { Status, AapiBody } from '../service/serviceObject'
import * as TE from 'fp-ts/TaskEither'
import { zero } from 'fp-ts/Array'
import { Toast } from 'primereact/toast'
import { useCookies } from 'react-cookie'

function SummaryPage() {
  const [psDictProductList, setPsDictProductList] = useState({})
  const [dataDict, setDataDict] = useState({})

  const [psList, setPsList] = useState<string[]>([])
  const [selectedPs, setSelectPs] = useState<string | ''>('')
  const [selectedProduct, setSelectProduct] = useState<string | ''>('')
  const [productList, setProductList] = useState([])
  const [subjectList, setSubjectList] = useState([])
  const [cookiesUser, setCookieUser, removeCookieUser] = useCookies(['user'])
  const preworkService = new PreworkService()

  const toast = useRef(null)
  const showError = (e) => {
    ;(toast.current as any).show({
      severity: 'error',
      summary: 'Error Message',
      detail: `Get ProductSuite Data Error: ${e}`,
      life: 3000,
    })
  }

  useEffect(() => {
    if(cookiesUser["user"] === undefined)
    {
      //window.location.href = 'https://www.tsmc.com/'
      console.log('Login')
    }
    else
    {
      setUpData()
    }
    
    // preworkService.getPsList().then((data) => setPsList(data))
  }, [])

  // ================================
  // let data:AapiBody[] = zero()
  // const dataDict = {}
  const setUpData = async () => {
    const nodeservice = new NodeService()

    // const data: AapiBody[] = await nodeservice.getProductSuiteData()

    const data = await TE.match<Error, Array<AapiBody>, Array<AapiBody>>(
      (e) => {
        console.log(`Get ProductSuite Data Error: ${e}`)
        showError(e)
        return zero<AapiBody>()
      },
      (r) => r
    )(nodeservice.getProductSuiteData())()

    setPsList(preworkService.collectProductSuiteNames(data))
    setDataDict(preworkService.collectDataDictionary(data))
    setPsDictProductList(preworkService.collectProductMap(data))
    console.log(preworkService.collectDataDictionary(data))
  }

  // =========================
  async function onPsChange(e: any) {
    //console.log(e)
    await setSelectPs(e.target.value)
    if (e.target.value) {
      setProductList(psDictProductList[e.target.value])
      // preworkService.getProductList(e.target.value).then((data) => setProductList(data))
      setSubjectList([])
    } else {
      setProductList([])
      setSubjectList([])
    }
  }
  async function onProductChange(e: any) {
    await setSelectProduct(e.target.value)
    setSubjectList(dataDict[selectedPs][e.target.value])
    // console.log(selectedPs, e.target.value)
    // preworkService.getSubjectData(selectedPs, e.target.value).then((data) => setSubjectList(data))
  }

  return (
    <div>
      <Toast ref={toast} />

      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
        <div className="d-block mb-4 mb-md-0">
          <h4>Event Summary</h4>
          <p className="mb-0">show all event list grouped by product suites and products.</p>
        </div>
      </div>
      <div className="p-grid">
        <div className="p-col-3">
          <Form.Group id="ps-filter">
            <Form.Label>Product Suites</Form.Label>
            <Form.Select id="psSelect" onChange={onPsChange} value={selectedPs}>
              <option value="">Select Product Suite</option>
              {psList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <div className="p-col-3 ">
          <Form.Group id="pd-filter">
            <Form.Label>Products</Form.Label>
            <Form.Select id="productSelect" onChange={onProductChange} value={selectedProduct}>
              <option value="">Select Product </option>

              {productList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
        <div className="p-offset-3 p-col-3">
          <Form.Group id="pd-filter">
            <Form.Label>Event Name Search</Form.Label>
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
        <DataTable value={subjectList} className="datatable-class" paginator>
          <Column field="title" header="Event Subject"></Column>
          <Column field="description" header="Description"></Column>
          <Column field="aapiOwner" header="Owner"></Column>
        </DataTable>
      </div>
    </div>
  )
}

export default SummaryPage
