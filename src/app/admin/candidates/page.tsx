"use client";
import { useState } from "react";

type C = { id:number; name:string; email:string; phone:string; skill:string; jlpt:string; status:string; matchJob:string; note:string; updated:string };

const INIT: C[] = [
  { id:1, name:"Nguyen Thi Lan",  email:"ntlan@gmail.com",  phone:"090-1234-5678", skill:"飲食",  jlpt:"N3", status:"interview", matchJob:"山本フーズ", note:"3年の調理経験あり", updated:"本日" },
  { id:2, name:"Pham Van Duc",    email:"pvduc@gmail.com",  phone:"090-2345-6789", skill:"製造",  jlpt:"N4", status:"interview", matchJob:"東京工場",   note:"溶接資格保有",       updated:"昨日" },
  { id:3, name:"Tran Van Duc",    email:"tvduc@gmail.com",  phone:"090-3456-7890", skill:"ホテル",jlpt:"N3", status:"offered",   matchJob:"グランドホテル大阪", note:"接客経験豊富", updated:"2日前" },
  { id:4, name:"Do Thi Mai",      email:"dtmai@gmail.com",  phone:"090-4567-8901", skill:"農業",  jlpt:"N5", status:"offered",   matchJob:"みどり農業",  note:"体力自信あり",      updated:"3日前" },
  { id:5, name:"Nguyen Van An",   email:"nvana@gmail.com",  phone:"090-5678-9012", skill:"飲食",  jlpt:"N3", status:"new",       matchJob:"未定",        note:"来日2ヶ月",          updated:"本日" },
  { id:6, name:"Le Thi Hoa",      email:"lthoa@gmail.com",  phone:"090-6789-0123", skill:"飲食",  jlpt:"N4", status:"new",       matchJob:"未定",        note:"ホール希望",         updated:"本日" },
  { id:7, name:"Pham Thi Thu",    email:"ptthu@gmail.com",  phone:"090-7890-1234", skill:"飲食",  jlpt:"N3", status:"working",   matchJob:"さくらレストラン", note:"安定就業中",     updated:"1週間前" },
  { id:8, name:"Nguyen Van Nam",  email:"nvnam@gmail.com",  phone:"090-8901-2345", skill:"飲食",  jlpt:"N4", status:"quit",      matchJob:"帰国済み",    note:"契約満了",          updated:"2週間前" },
];

const ST: Record<string,{ja:string;vn:string;tc:string;tb:string}> = {
  new:      {ja:"新規登録",  vn:"Mới đăng ký",     tc:"#0C447C",tb:"#E6F1FB"},
  interview:{ja:"面接中",    vn:"Đang phỏng vấn",  tc:"#633806",tb:"#FAEEDA"},
  offered:  {ja:"内定済み",  vn:"Đã offer",         tc:"#534AB7",tb:"#EEEDFE"},
  working:  {ja:"就業中",    vn:"Đang làm việc",   tc:"#27500A",tb:"#EAF3DE"},
  quit:     {ja:"退職",      vn:"Nghỉ việc",        tc:"#444441",tb:"#F1EFE8"},
};
const JLPT_C: Record<string,{tc:string;tb:string}> = {
  N1:{tc:"#A32D2D",tb:"#FCEBEB"},N2:{tc:"#633806",tb:"#FAEEDA"},
  N3:{tc:"#27500A",tb:"#EAF3DE"},N4:{tc:"#444441",tb:"#F1EFE8"},N5:{tc:"#6B6B6B",tb:"#F1EFE8"},
};

export default function CandidatesPage() {
  const [cands, setCands] = useState<C[]>(INIT);
  const [selected, setSelected] = useState<C|null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", skill:"飲食", jlpt:"N4", matchJob:"", note:"" });

  const filtered = cands.filter(c => {
    const ok1=filter==="all"||c.status===filter;
    const ok2=search===""||c.name.toLowerCase().includes(search.toLowerCase())||c.email.includes(search)||c.matchJob.includes(search);
    return ok1&&ok2;
  });
  const counts: Record<string,number> = {all:cands.length};
  Object.keys(ST).forEach(k=>{counts[k]=cands.filter(c=>c.status===k).length;});

  const updateStatus=(id:number,status:string)=>{
    setCands(p=>p.map(c=>c.id===id?{...c,status,updated:"たった今"}:c));
    setSelected(p=>p?.id===id?{...p,status}:p);
  };
  const addCand=(e:React.FormEvent)=>{
    e.preventDefault();
    setCands([{id:Date.now(),...form,status:"new",updated:"たった今"},...cands]);
    setShowForm(false);
    setForm({name:"",email:"",phone:"",skill:"飲食",jlpt:"N4",matchJob:"",note:""});
  };
  const B={border:"0.5px solid rgba(11,31,58,0.1)"};

  return (
    <div>
      <div style={{background:"#fff",...B,borderTop:"none",borderLeft:"none",borderRight:"none",padding:"0 20px",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"14px",fontWeight:700,color:"#0B1F3A"}}>人材管理 / Quản lý Ứng viên</div>
          <div style={{fontSize:"10px",color:"#6B6B6B"}}>各候補者のステータスを管理 · Theo dõi trạng thái từng người</div>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <input type="text" placeholder="名前・メールで検索..." value={search} onChange={e=>setSearch(e.target.value)} style={{padding:"6px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none",width:"200px"}}/>
          <button onClick={()=>setShowForm(true)} style={{padding:"7px 14px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"#0B1F3A",color:"#fff",border:"none",cursor:"pointer"}}>+ 追加 / Thêm</button>
        </div>
      </div>
      <div style={{padding:"16px 20px"}}>
        {/* Status filter pills */}
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>
          {[{key:"all",ja:"全件",vn:"Tất cả"},...Object.entries(ST).map(([k,v])=>({key:k,ja:v.ja,vn:v.vn}))].map(t=>(
            <button key={t.key} onClick={()=>setFilter(t.key)} style={{padding:"5px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:600,border:`1px solid ${filter===t.key?"#0B1F3A":"rgba(11,31,58,0.15)"}`,background:filter===t.key?"#0B1F3A":"#fff",color:filter===t.key?"#fff":"#6B6B6B",cursor:"pointer",whiteSpace:"nowrap"}}>
              {t.ja} · {t.vn} ({counts[t.key]||0})
            </button>
          ))}
        </div>

        {showForm && (
          <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",marginBottom:"14px"}}>
            <div style={{fontSize:"13px",fontWeight:700,color:"#0B1F3A",marginBottom:"12px"}}>新規候補者追加 / Thêm ứng viên mới</div>
            <form onSubmit={addCand}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px",marginBottom:"10px"}}>
                {[{f:"name",l:"氏名 / Họ tên *",p:"Nguyen Thi Lan"},{f:"email",l:"Email *",p:"email@gmail.com"},{f:"phone",l:"電話 / SĐT",p:"090-xxxx-xxxx"},{f:"matchJob",l:"志望先 / Công việc muốn",p:"山本フーズ"}].map(x=>(
                  <div key={x.f}>
                    <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>{x.l}</label>
                    <input required={x.f==="name"||x.f==="email"} type="text" placeholder={x.p} value={(form as Record<string,string>)[x.f]} onChange={e=>setForm({...form,[x.f]:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
                  </div>
                ))}
                <div>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>業種 / Ngành</label>
                  <select value={form.skill} onChange={e=>setForm({...form,skill:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    {["飲食","製造","農業","ホテル","その他"].map(i=><option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>日本語 / Tiếng Nhật</label>
                  <select value={form.jlpt} onChange={e=>setForm({...form,jlpt:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}>
                    {["N1","N2","N3","N4","N5","なし"].map(j=><option key={j}>{j}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:"10px"}}>
                <label style={{display:"block",fontSize:"10px",color:"#6B6B6B",marginBottom:"4px",fontWeight:600}}>備考 / Ghi chú</label>
                <input type="text" placeholder="経験・特技など / Kinh nghiệm, điểm mạnh..." value={form.note} onChange={e=>setForm({...form,note:e.target.value})} style={{width:"100%",padding:"7px 10px",borderRadius:"6px",border:"0.5px solid rgba(11,31,58,0.2)",fontSize:"12px",outline:"none"}}/>
              </div>
              <div style={{display:"flex",gap:"8px"}}>
                <button type="submit" style={{padding:"7px 16px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"#0B1F3A",color:"#fff",border:"none",cursor:"pointer"}}>保存 / Lưu</button>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:"7px 16px",borderRadius:"6px",fontSize:"12px",fontWeight:600,background:"transparent",color:"#6B6B6B",border:"0.5px solid rgba(11,31,58,0.2)",cursor:"pointer"}}>キャンセル / Hủy</button>
              </div>
            </form>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 340px":"1fr",gap:"12px"}}>
          <div style={{background:"#fff",...B,borderRadius:"10px",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
              <thead><tr style={{background:"#F6F7F9"}}>
                {["候補者 / Ứng viên","業種","日本語","マッチ先 / Công việc","ステータス / Trạng thái","更新"].map(h=>(
                  <th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:"10px",color:"#6B6B6B",fontWeight:600,borderBottom:"0.5px solid rgba(11,31,58,0.1)",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(c=>{
                  const st=ST[c.status]; const jc=JLPT_C[c.jlpt]||JLPT_C["N5"];
                  const initials=c.name.split(" ").slice(-2).map((w:string)=>w[0]).join("").toUpperCase();
                  return(
                    <tr key={c.id} onClick={()=>setSelected(selected?.id===c.id?null:c)} style={{borderBottom:"0.5px solid rgba(11,31,58,0.05)",cursor:"pointer",background:selected?.id===c.id?"#E6F1FB":"transparent"}}>
                      <td style={{padding:"10px 12px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                          <div style={{width:"28px",height:"28px",borderRadius:"50%",background:st.tb,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,color:st.tc,flexShrink:0}}>{initials}</div>
                          <div>
                            <div style={{fontWeight:600,color:"#0B1F3A"}}>{c.name}</div>
                            <div style={{fontSize:"10px",color:"#6B6B6B"}}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"10px 12px"}}><span style={{background:"#E6F1FB",color:"#0C447C",fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{c.skill}</span></td>
                      <td style={{padding:"10px 12px"}}><span style={{background:jc.tb,color:jc.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px"}}>{c.jlpt}</span></td>
                      <td style={{padding:"10px 12px",fontSize:"11px",color:c.matchJob!=="未定"&&c.matchJob!=="帰国済み"?"#185FA5":"#6B6B6B",fontWeight:c.matchJob!=="未定"?600:400}}>{c.matchJob}</td>
                      <td style={{padding:"10px 12px"}}>
                        <div style={{background:st.tb,color:st.tc,fontSize:"10px",fontWeight:700,padding:"2px 7px",borderRadius:"4px",display:"inline-block"}}>
                          {st.ja}<br/><span style={{fontWeight:400,fontSize:"9px"}}>{st.vn}</span>
                        </div>
                      </td>
                      <td style={{padding:"10px 12px",fontSize:"10px",color:"#6B6B6B"}}>{c.updated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selected&&(
            <div style={{background:"#fff",...B,borderRadius:"10px",padding:"16px",height:"fit-content",position:"sticky",top:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                <div>
                  <div style={{fontSize:"15px",fontWeight:700,color:"#0B1F3A"}}>{selected.name}</div>
                  <div style={{fontSize:"10px",color:"#6B6B6B"}}>{selected.skill} · {selected.jlpt} · {ST[selected.status].ja}</div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#6B6B6B",fontSize:"18px"}}>×</button>
              </div>
              {[
                {l:"Email", v:selected.email},
                {l:"電話 / SĐT",v:selected.phone||"—"},
                {l:"業種 / Ngành",v:selected.skill},
                {l:"日本語 / Tiếng Nhật",v:selected.jlpt},
                {l:"志望先 / Công việc",v:selected.matchJob},
                {l:"備考 / Ghi chú",v:selected.note||"—"},
              ].map(r=>(
                <div key={r.l} style={{display:"flex",gap:"8px",marginBottom:"8px",fontSize:"12px"}}>
                  <span style={{color:"#6B6B6B",width:"110px",flexShrink:0}}>{r.l}</span>
                  <span style={{color:"#0B1F3A",fontWeight:500,flex:1,wordBreak:"break-word"}}>{r.v}</span>
                </div>
              ))}
              <div style={{borderTop:"0.5px solid rgba(11,31,58,0.08)",paddingTop:"12px",marginTop:"4px"}}>
                <div style={{fontSize:"10px",color:"#6B6B6B",fontWeight:600,marginBottom:"8px"}}>ステータス変更 / Đổi trạng thái</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                  {Object.entries(ST).map(([k,v])=>(
                    <button key={k} onClick={()=>updateStatus(selected.id,k)} style={{padding:"5px 8px",borderRadius:"5px",fontSize:"10px",fontWeight:600,cursor:"pointer",background:selected.status===k?v.tc:v.tb,color:selected.status===k?"#fff":v.tc,border:`1px solid ${v.tc}`}}>
                      {v.ja} · {v.vn}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:"7px",marginTop:"12px"}}>
                <a href={`mailto:${selected.email}`} style={{flex:1,padding:"8px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:"#0B1F3A",color:"#fff",textDecoration:"none"}}>メール送信</a>
                {selected.phone&&<a href={`tel:${selected.phone}`} style={{flex:1,padding:"8px",borderRadius:"7px",fontSize:"11px",fontWeight:600,textAlign:"center",background:"#EAF3DE",color:"#27500A",textDecoration:"none",border:"0.5px solid #27500A"}}>電話する</a>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}