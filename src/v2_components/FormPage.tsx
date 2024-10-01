import { useLocation } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from "react";

// Define props interface to include startLoading and stopLoading
interface FormPageProps {
  startLoading: () => void;
  stopLoading: () => void;
}

interface FormEntity {
    formId: number;
    dbName: string;
    formName: string;
    headers: string;
    customSettings: string;
    userId: number;
    createdAt: string;
}

export default function FormPage({ startLoading, stopLoading }: FormPageProps) {
  const loc = useLocation();
  const formid = loc.state.formid;
  const [formId, setFormId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formEntity, setFormEntity] = useState<FormEntity | null>(null);

async function getFormEntity(formId: number): Promise<FormEntity | null> {
    try {
    const response = await axios.get(`http://localhost:8080/getUserForms/${formId}`);
    return response.data;
    } catch (error) {
    console.error("Error fetching form entity:", error);
    return null;
    }
}
  
   // Fetch the form entity once, and update the formId and formName
   // Use effect to fetch form entity on component mount
   useEffect(() => {
    const fetchFormEntity = async () => {
      startLoading();
      const entity = await getFormEntity(formid);
      if (entity) {
        setFormName(entity.formName);
        setFormId(entity.formId); // Update reportId here
        console.log("Fetched Report Entity:", entity);
      }
    console.log("Form ID: ", formid);
      stopLoading();
    };
    fetchFormEntity();
  }, [formId]);

  return (
    <div>
      <h2>Form Entity Details</h2>
      {formEntity ? (
        <div>
          <p><strong>Form ID:</strong> {formId}</p>
          <p><strong>Form Name:</strong> {formName}</p>
        </div>
      ) : (
        <p>Loading form data...</p>
      )}
    </div>
  );
}
