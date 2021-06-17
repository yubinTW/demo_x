import React, { useState, useEffect, useRef } from 'react'

import 'primeicons/primeicons.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'

import { Dropdown } from 'primereact/dropdown'
import { PreworkService } from './../service/preworkService'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'

function SummaryPage() {
  const [psList, setPsList] = useState([])
  const [selectedPs, setSelectPs] = useState<string | ''>('')
  const [selectedProduct, setSelectProduct] = useState<string | ''>('')
  const [productList, setProdcuctList] = useState([])
  const [subjectList, setSubjectList] = useState([])
  const preworkService = new PreworkService()

  //const doc = parser.parse(nodeservice.getApiData());

  useEffect(() => {
    preworkService.getPsList().then((data) => setPsList(data))
  }, [])

  async function onPsChange(e: { value: any }) {
    await setSelectPs(e.value)
    preworkService.getProductList(e.value).then((data) => setProdcuctList(data))
  }
  async function onProductChange(e: { value: any }) {
    await setSelectProduct(e.value)
    console.log(selectedPs, e.value)
    preworkService.getSubjectData(selectedPs, e.value).then((data) => setSubjectList(data))
  }
  return (
    <div>
      <Dropdown
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
      />
      <div className="card">
        <DataTable value={subjectList}>
          <Column field="subjectName" header="Event Subject"></Column>
          <Column field="description" header="Description"></Column>
          <Column field="aapiOwner" header="Owner"></Column>
        </DataTable>
      </div>
    </div>
  )
}

export default SummaryPage
