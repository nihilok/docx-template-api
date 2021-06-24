import React, {useState} from 'react';
import NewTemplateFormComponent from "./NewTemplateFormComponent";

const NewTemplateView = ({getTemplates}) => {

  const [showHelp, setShowHelp] = useState(false)

  return (
      <>
        <h3>Upload Template</h3>
        <NewTemplateFormComponent getTemplates={getTemplates}/>
        {showHelp ?
            <div style={{margin: '1rem 0 0 0'}} className="container help"><small>Templates should be in the form of a .docx file, formatted as you
              would like the final document to be. Variables with distinct names should be declared between
              double {'{{}}'}</small>
              <p>e.g: <code>{'{{variable1}}'} some other text {'{{variable2}}'}</code></p>
              <small>To specify that a variable should represent 1 or more paragraphs you should prefix the variable
                with
                "__para_"</small> <p>e.g: <code>{'{{__para_variable}}'}</code></p>
              <small>Variables prefixed with "time_" will render a time input in the form.</small>
            <p>e.g: <code>{'{{time_of_appointment}}'}</code></p>
            </div> : ''}
        <div className="form-group" style={{margin: '1rem'}}><a type="submit" onClick={() => setShowHelp(!showHelp)}
                                                                    >{showHelp ? 'Hide Help' : 'Show Help'}</a></div>
      </>
  );
}

export default NewTemplateView;