import React, { useState, useEffect } from 'react'

import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Checkbox} from 'primereact/checkbox';
import {RadioButton} from 'primereact/radiobutton';
import {Dropdown} from 'primereact/dropdown';
import {InputTextarea} from 'primereact/inputtextarea';

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
        <h5>createAPI Page</h5>
        <div className="p-grid">
        <div className="p-col" />
        <div className="p-col-10" >
          <div className="p-fluid p-formgrid p-grid">
            <div className="p-field p-col-12 p-md-6">
                <label htmlFor="firstname6">Firstname</label>
                <InputText id="firstname6" type="text" />
            </div>
            <div className="p-field p-col-12 p-md-2">
                <label htmlFor="state">State</label>
                <Dropdown inputId="state" value={selectedState} options={states} onChange={onStateChange} placeholder="Select" optionLabel="name"/>
            </div>
            
          </div>
        </div>
        <div className="p-col" />
        </div>
      </div>
    )
  }
  
  export default CreateAPI