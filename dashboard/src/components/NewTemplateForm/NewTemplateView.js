import React, {useState} from 'react';
import NewTemplateFormComponent from "./NewTemplateFormComponent";

const NewTemplateView = ({getTemplates}) => {

  const [showHelp, setShowHelp] = useState(false)

  return (
      <>
        <h3>Upload Template</h3>
        <NewTemplateFormComponent getTemplates={getTemplates || undefined}/>
        {showHelp ?
            <div style={{margin: '1rem 0 0 0'}}><small>Templates should be in the form of a .docx file, formatted as you would like the final document to be. Variables are declared between double {'{{}}'}</small>
              <p>e.g: <code>{'{{variable}}'}</code></p>
              <small>To specify that a variable should represent 1 or more paragraphs you should prefix the variable with
                "__para_"</small> <p>e.g: <code>{'{{__para_variable}}'}</code></p></div> : ''}
        <div className="form-group" style={{margin: '1rem'}}><input type="submit" onClick={() => setShowHelp(!showHelp)} value={showHelp ? 'Hide Help' : 'Show Help'}/></div>
      </>
  );
}

export default NewTemplateView;