import React, { useState, useEffect, useRef } from 'react'

import 'primeicons/primeicons.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'
import '../assets/css/datatable.css'
import { Form, InputGroup } from '@themesberg/react-bootstrap'
// import { Dropdown } from 'primereact/dropdown'
import { PreworkService } from './../service/preworkService'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function SummaryPage() {
  const [psList, setPsList] = useState([])
  const [selectedPs, setSelectPs] = useState<string | ''>('')
  const [selectedProduct, setSelectProduct] = useState<string | ''>('')
  const [productList, setProductList] = useState([])
  const [subjectList, setSubjectList] = useState([])
  const preworkService = new PreworkService()

  //const doc = parser.parse(nodeservice.getApiData());

  useEffect(() => {
    preworkService.getPsList().then((data) => setPsList(data))
  }, [])

  // async function onPsChange(e: { value: any }) {
  //   await setSelectPs(e.value)
  //   preworkService.getProductList(e.value).then((data) => setProdcuctList(data))
  // }
  async function onPsChange(e: any) {
    //console.log(e)
    await setSelectPs(e.target.value)
    if (e.target.value) {
      preworkService.getProductList(e.target.value).then((data) => setProductList(data))
      setSubjectList([])
    } else {
      setProductList([])
      setSubjectList([])
    }
  }
  async function onProductChange(e: any) {
    await setSelectProduct(e.target.value)
    console.log(selectedPs, e.target.value)
    preworkService.getSubjectData(selectedPs, e.target.value).then((data) => setSubjectList(data))
  }

  return (
    <div>
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
            <Form.Select onChange={onPsChange} value={selectedPs}>
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
            <Form.Select onChange={onProductChange} value={selectedProduct}>
              <option>Select Product </option>

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

      {/* <Dropdown
        value={selectedPs}
        options={psList}
        onChange={onPsChange}
        optionLabel="name"
        placeholder="Select a Product Suite"
      />
      <Dropdown
        value={selectedProduct}
        options={productList}
        onChange={onProductChange}
        optionLabel="name"
        placeholder="Select a Product"
      /> */}
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
