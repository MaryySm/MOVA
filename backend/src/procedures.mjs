// Only fixed procedure names are accepted; client input never becomes SQL syntax.
export async function procedure(db, name, args = [], output = false) {
 if (!/^sp_[a-z_]+$/.test(name)) throw new Error('Invalid procedure');
 try {
  const params=args.map((_,i)=>`$${i+1}`).join(',');
  const result=await db.query(`CALL ${name}(${params}${output?(args.length?',':'')+'NULL':''})`,args);
  return output?result.rows[0]?.p_result:undefined;
 } catch(error) {
  if(error.code==='P0001' && /^\d{3}$/.test(error.detail||'')) error.status=Number(error.detail);
  throw error;
 }
}
