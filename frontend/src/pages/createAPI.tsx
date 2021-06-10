import React, { useState, useEffect } from 'react'

import {InputText} from 'primereact/inputtext';
import {Checkbox} from 'primereact/checkbox';
import {Dropdown} from 'primereact/dropdown';
import {InputTextarea} from 'primereact/inputtextarea';
import { Button } from '@themesberg/react-bootstrap';

import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';

function CreateAPI() {
  const [selectedState, setSelectedState] = useState<any>(null);
  let states = [
    {name: 'Arizona', code: 'Arizona'},
    {name: 'California', value: 'California'},
    {name: 'Florida', code: 'Florida'},
    {name: 'Ohio', code: 'Ohio'},
    {name: 'Washington', code: 'Washington'}
  ]
  const onStateChange = (e:any) => {
    setSelectedState(e.value);
  }
    return (
      <div className="createAPI">
        
        <div className="p-grid">
        <div className="p-col" />
        <div className="p-col-10" >
          <div className="p-fluid p-formgrid p-grid">
        
            <div className="p-field p-col-5 ">
                <label htmlFor="firstname6">API Name</label>
                <InputText id="firstname6" type="text" />
            </div>
            <div className="p-field p-col-5">
              <label htmlFor="state">Product Suite</label>
              <Dropdown inputId="state" value={selectedState} options={states} onChange={onStateChange} placeholder="Select" optionLabel="name"/>
            </div>
            <div className="p-field p-col-10">
                <label htmlFor="address">Description</label>
                <InputTextarea id="address" rows={4} />
            </div>
            <div className="p-field p-col-2" />
            <div className="p-field p-col-2">
              <Button variant="outline-secondary" className=" me-3" >Button</Button>
            </div>
            
          </div>
        </div>
        <div className="p-col" />
        </div>
      </div>
    )
  }
  
  export default CreateAPI