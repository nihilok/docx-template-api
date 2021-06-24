import React, {useState} from 'react';
import NewTemplateFormComponent from "./NewTemplateFormComponent";

const NewTemplateView = ({getTemplates}) => {

  const [showHelp, setShowHelp] = useState(false)

  return (
      <>
        <h2>Upload Template</h2>
        <NewTemplateFormComponent getTemplates={getTemplates}/>
        {showHelp ?
            <div style={{margin: '1rem 0 0 0'}} className="container help"><small>Templates should be in the form of a .docx file, formatted as you
              would like the final document to be. Variables should be declared with distinct names between
              double {'{{}}'} without spaces or punctuation (underscore is fine).</small>
              <p>e.g: <code>My name is {'{{name}}'} and I'm {'{{age}}'} years old.</code></p>
              <small>To specify that a variable should represent 1 or more paragraphs you should prefix the variable
                with
                "__para_"</small> <p>e.g: <code>{'{{__para_variable}}'}</code></p>
              <small>Variables prefixed with "time_" will render a time input in the form.</small>
            <p>e.g: <code>{'{{time_of_appointment}}'}</code></p>
              <small>Variable names <code>{"{{time}}, {{year}}, {{month}}, & {{day}}"}</code> are reserved, and will return HH:MM, YYYY, MM, & DD respectively at the time of rendering.</small>
            </div> : ''}
        <div className="form-group" style={{margin: '1rem'}}><a href="#" type="submit" onClick={() => setShowHelp(!showHelp)}
                                                                    >{showHelp ? 'Hide Help' : 'Show Help'}</a></div>
      </>
  );
}

export default NewTemplateView;