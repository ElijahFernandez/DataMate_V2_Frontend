import FileScreen from "../components/FileScreen";

type FilePageProp = {
  setFileId: (num: number) => void;
};

export default function FilePage({ setFileId }: FilePageProp) {
  return (
    <div>
      <FileScreen setFileId={setFileId}></FileScreen>
    </div>
  );
}
