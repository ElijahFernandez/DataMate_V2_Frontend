import { useLocation } from "react-router-dom";
import axios from 'axios';
import { useEffect, useState } from "react";

// Define props interface to include startLoading and stopLoading
interface FormPageProps {
  startLoading: () => void;
  stopLoading: () => void;
}

// Define the FormEntity interface
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
  const formIdFromLocation = loc.state?.formid || null;  // Get formId from location state
  const [formEntity, setFormEntity] = useState<FormEntity | null>(null); // To store the fetched form data
  const [formId, setFormId] = useState<number | null>(formIdFromLocation); // Initially set from location state

  // Fetch the form entity from the API
  async function getFormEntity(formId: number): Promise<FormEntity | null> {
    try {
      const response = await axios.get(`http://localhost:8080/getForms/${formId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching form entity:", error);
      return null;
    }
  }

  // useEffect to fetch the form data on component mount or when formId changes
  useEffect(() => {
    const fetchFormEntity = async () => {
        console.log("form id: ", formId);
      if (formId) {  // Only fetch if formId exists
        startLoading();
        const entity = await getFormEntity(formId);
        if (entity) {
          setFormEntity(entity);  // Set the fetched form data to formEntity
          console.log("Fetched Form Entity:", entity);
        }
        stopLoading();
      }
    };

    fetchFormEntity();
  }, [formId, startLoading, stopLoading]);

  return (
    <div>
      <h2>Form Entity Details</h2>
      {formEntity ? (
        <div>
          <p><strong>Form ID:</strong> {formEntity.formId}</p>
          <p><strong>Form Name:</strong> {formEntity.formName}</p>
          <p><strong>DB Name:</strong> {formEntity.dbName}</p>
          <p><strong>Headers:</strong> {formEntity.headers}</p>
          <p><strong>Custom Settings:</strong> {formEntity.customSettings}</p>
          <p><strong>User ID:</strong> {formEntity.userId}</p>
          <p><strong>Created At:</strong> {formEntity.createdAt}</p>
        </div>
      ) : (
        <p>Loading form data...</p>
      )}
    </div>
  );
}
