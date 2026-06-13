

import "./TravelPermissionStyles.css";

export interface Companion {
  name: string;
  position: string;
}

export interface TravelPermissionData {
  documentNo: string;
  subject: string;
  recipient: string;
  title: string;

  fullName: string;
  position: string;
  department: string;

  destination: string;
  province: string;
  orderedBy?: string;

  objective: string;

  departureDate: string;
  departureTime: string;

  requestDate?: string;
  returnDate: string;

  totalDays: string;

  companions: Companion[];

  replacementName?: string;
  replacementPosition?: string;

  vehicleNo?: string;

  requesterName: string;
  requesterPosition: string;

  approverName: string;
  approverPosition: string;

  approveDate: string;
}

interface Props {
  data: TravelPermissionData;
}

function FormLine({
  label,
  value,
  width = "100%",
}: {
  label: string;
  value?: string;
  width?: string;
}) {
  return (
    <div className="form-line">
      <span className="form-label">
        {label}
      </span>

      <span
        className="form-value"
        style={{
          width,
          // ถ้ามีการกำหนดความกว้างมา ให้ปิด flex เพื่อไม่ให้โดนขยาย
          flex: width !== "100%" ? "0 0 auto" : "1"
        }}
      >
        {value || ""}
      </span>
    </div>
  );
}

function SignatureBlock({
  title,
  name,
  position,
  date,
}: {
  title?: string;
  name: string;
  position: string;
  date: string;
}) {
  return (
    <div className="signature-block">

      {title && (
        <div className="signature-title">
          {title}
        </div>
      )}

      <div className="signature-space" />

      <div className="signature-name">
        ({name})
      </div>

      <div className="signature-position">
        {position}
      </div>

      <div className="signature-date">
        วันที่ {date || "................................................"}
      </div>
    </div>
  );
}

export default function TravelPermissionForm({
  data,
}: Props) {

  return (

    <div className="a4-page">

      <div className="travel-document">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <header className="document-header">

          <div className="header-top">

            <div className="header-left">
              กรมชลประทาน
              <br />
              กระทรวงเกษตรและสหกรณ์
            </div>

            <div className="header-right">
              ชป.๓๘๔
            </div>

          </div>

          <div className="garuda-wrapper">

            <img
              src="/garuda.png"
              alt="garuda"
              className="garuda"
            />

          </div>

          <div className="document-title">
            แบบขออนุญาตไปราชการ
          </div>

          <div className="document-no-row">

            <span>ที่</span>

            <span className="inline-line long">
              {data.documentNo}
            </span>

          </div>

        </header>

        {/* ========================= */}
        {/* BODY */}
        {/* ========================= */}

        <section className="document-body">

          <FormLine
            label="เรื่อง"
            value={data.subject}
          />

          <FormLine
            label="เรียน"
            value={data.recipient}
          />

          <FormLine
            label="ข้าพเจ้า นาย / นาง / นางสาว"
            value={`${data.title}${data.fullName}`}
          />

          <div className="double-row">

            <FormLine
              label="ตำแหน่ง"
              value={data.position}
              width="220px"
            />

            <FormLine
              label="กอง / สชป. / โครงการ"
              value={data.department}
              width="260px"
            />

          </div>

          <div className="double-row">

            <FormLine
              label="ขออนุญาตไปราชการ"
              value={data.destination}
              width="300px"
            />

            <FormLine
              label="จังหวัด"
              value={data.province}
              width="180px"
            />

          </div>

          {/* Objective */}

          <div className="paragraph">

            {data.objective}

          </div>

          {/* Date */}

          <div className="paragraph">

            โดยจะออกเดินทางในวันที่

            <span className="inline-line medium">
              {data.departureDate}
            </span>

            เวลา

            <span className="inline-line small">
              {data.departureTime}
            </span>

            และจะกลับประมาณวันที่

            <span className="inline-line medium">
              {data.returnDate}
            </span>

          </div>

          <div className="paragraph">

            รวมเวลาไปราชการในครั้งนี้

            <span className="inline-line small">
              {data.totalDays}
            </span>

            วัน

          </div>

        </section>

        {/* ========================= */}
        {/* TABLE */}
        {/* ========================= */}

        <section className="table-section">

          <div className="table-title">
            ในการไปราชการครั้งนี้ ข้าพเจ้าขอให้มีผู้ร่วมเดินทางไปด้วย ดังนี้
          </div>

          <table className="travel-table" style={{ width: "94%", margin: "0 auto" }}>

            <thead>
              <tr>
                <th style={{ width: "60px", borderBottom: "none" }}>
                  ลำดับที่
                </th>

                <th>
                  รายชื่อ
                </th>

                <th style={{ width: "240px" }}>
                  ตำแหน่ง
                </th>
              </tr>
            </thead>

            <tbody>

              {/* เพิ่ม fallback ให้ companions ป้องกันแอปพังหากข้อมูลเป็น null */}
              {Array.from({ length: Math.max(7, (data.companions || []).length) }).map(
                (_, index) => {

                  const person =
                    (data.companions || [])[index];

                  return (
                    <tr key={index}>

                      <td className="center" style={{ borderBottom: "none" }}>
                        {index + 1}
                      </td>

                      <td style={{ borderBottom: "none", position: "relative" }}>
                        <div style={{ borderBottom: "1px dotted #000", position: "absolute", bottom: "4px", left: "4px", right: "12px" }}></div>
                        <span style={{ position: "relative", zIndex: 1 }}>{person?.name || ""}</span>
                      </td>

                      <td style={{ borderBottom: "none", position: "relative" }}>
                        <div style={{ borderBottom: "1px dotted #000", position: "absolute", bottom: "4px", left: "4px", right: "12px" }}></div>
                        <span style={{ position: "relative", zIndex: 1 }}>{person?.position || ""}</span>
                      </td>

                    </tr>
                  );
                }
              )}
              {/* ครึ่งบรรทัดใต้เส้นปะก่อนถึงเส้นทึบ */}
              <tr style={{ height: "18px" }}>
                <td style={{ borderBottom: "none", borderTop: "none" }}></td>
                <td style={{ borderBottom: "none", borderTop: "none" }}></td>
                <td style={{ borderBottom: "none", borderTop: "none" }}></td>
              </tr>

            </tbody>

          </table>

        </section>

        {/* ========================= */}
        {/* REPLACEMENT */}
        {/* ========================= */}

        <section className="replacement-section">

          <div className="paragraph">

            ในระหว่างที่ข้าพเจ้าไปราชการนี้
            ขออนุมัติให้
            นาย / นาง / นางสาว

            <span className="inline-line medium">
              {data.replacementName}
            </span>

            ตำแหน่ง

            <span className="inline-line medium">
              {data.replacementPosition}
            </span>

            ปฏิบัติหน้าที่แทน

          </div>

          <div className="paragraph">

            และขออนุมัติใช้

            <span className="inline-line medium">
              {data.vehicleNo}
            </span>

            เป็นพาหนะเดินทาง

          </div>

          <div className="paragraph">
            เมื่อกลับจากราชการแล้ว ข้าพเจ้าจะทำรายงานเสนอ ตามระเบียบ
          </div>

          <div className="paragraph" style={{ width: "50%", textAlign: "center" }}>
            จึงเรียนมาเพื่อโปรดพิจารณา
          </div>

        </section>

        {/* ========================= */}
        {/* SIGNATURE */}
        {/* ========================= */}

        <section className="signature-section" style={{ marginTop: "60px" }}>

          <div className="signature-row">

            <div style={{ display: "flex", flexDirection: "column", paddingLeft: "15px", alignItems: "flex-start" }}>
              {/* คำว่าอนุญาต ขยับขึ้นมาเพื่อให้มีที่ว่างเอาไว้เซ็นลายเซ็น และขยับไปทางซ้าย */}
              <div style={{ marginTop: "15px", marginBottom: "40px", width: "100%", textAlign: "left" }}>อนุญาต</div>

              <div style={{ marginTop: "10px" }}>
                <SignatureBlock
                  name={data.approverName}
                  position={data.approverPosition}
                  date={data.approveDate}
                />
              </div>
            </div>

            <SignatureBlock
              name={data.requesterName}
              position={data.requesterPosition}
              date={data.requestDate || data.approveDate}
            />

          </div>

        </section>

      </div>

    </div>
  );
}
