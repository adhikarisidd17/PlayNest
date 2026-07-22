import{useForm}from'react-hook-form';import{zodResolver}from'@hookform/resolvers/zod';import{z}from'zod';import{useState}from'react';import{useNavigate}from'react-router-dom';import{format}from'date-fns';import{supabase}from'../lib/supabase';import{useAuth}from'../App';import{localities}from'../data/demo';
const categories=['Playground meetup','Park meetup','Library activity','Museum visit','Family café meetup','Sports and games','Walk or stroller meetup','Arts and crafts','Other public family activity'];const ages=['0–2','3–5','6–8','9–12','13+'];const required=(label:string)=>z.string().min(1,`${label} is required.`);
const schema=z.object({title:z.string().trim().min(4,'Please enter an event title of at least 4 characters.').max(100,'Keep the title under 100 characters.'),category:required('Activity category'),description:z.string().trim().min(20,'Please describe the activity in at least 20 characters.').max(1500,'Keep the description under 1,500 characters.'),locality_id:z.string().uuid('Please choose a locality.'),address_text:z.string().trim().min(3,'Please enter a public venue address.').max(160,'Keep the address under 160 characters.').refine(x=>!/(door\s*code|apartment|floor\s*\d)/i.test(x),'Use a public address without a floor, apartment or door code.'),start_date:required('Start date'),start_time:required('Start time'),end_date:required('End date'),end_time:required('End time'),age_bands:z.array(z.string()).min(1,'Choose at least one age band.'),max_children:z.coerce.number({invalid_type_error:'Enter the maximum number of children.'}).int('Use a whole number.').min(1,'Allow at least one child.').max(20,'The maximum is 20 children.'),max_adults:z.coerce.number({invalid_type_error:'Enter the maximum number of adults.'}).int('Use a whole number.').min(1,'Allow at least one adult.').max(40,'The maximum is 40 adults.'),environment:z.enum(['indoor','outdoor','both']),languages:required('At least one language'),bring_notes:z.string().max(500,'Keep this note under 500 characters.'),approval_mode:z.enum(['manual','automatic'])}).refine(v=>new Date(`${v.end_date}T${v.end_time}`)>new Date(`${v.start_date}T${v.start_time}`),{message:'End date and time must be after the start.',path:['end_date']});type Form=z.infer<typeof schema>;
export function CreateEvent(){const{session}=useAuth();const[done,setDone]=useState<string|null>(null);const[saveError,setSaveError]=useState('');const navigate=useNavigate();const today=format(new Date(),'yyyy-MM-dd');const{register,handleSubmit,watch,formState:{errors,isSubmitting}}=useForm<Form>({resolver:zodResolver(schema),defaultValues:{approval_mode:'manual',environment:'outdoor',age_bands:[],bring_notes:'',max_children:8,max_adults:8,start_date:today,end_date:today,start_time:'10:00',end_time:'11:30'}});
const startDate=watch('start_date');const Err=({name}:{name:keyof Form})=>errors[name]?<span className="field-error" role="alert">{errors[name]?.message}</span>:null;async function save(v:Form){if(!session)return;setSaveError('');const locality=localities.find(l=>l.id===v.locality_id);const venueName=v.address_text.split(',')[0]?.trim()||`Public venue in ${locality?.name??'locality'}`;const{data:venue,error:venueError}=await supabase.from('venues').insert({locality_id:v.locality_id,name:venueName,address_text:v.address_text,venue_type:'public',is_public:true,approval_status:'pending',created_by:session.user.id}).select().single();if(venueError){setSaveError(venueError.message);return}const{data:event,error}=await supabase.from('events').insert({organizer_id:session.user.id,locality_id:v.locality_id,venue_id:venue.id,title:v.title,description:v.description,category:v.category,starts_at:new Date(`${v.start_date}T${v.start_time}:00`).toISOString(),ends_at:new Date(`${v.end_date}T${v.end_time}:00`).toISOString(),timezone:'Europe/Stockholm',age_bands:v.age_bands,max_children:v.max_children,max_adults:v.max_adults,siblings_allowed:false,guardian_required:true,environment:v.environment,languages:v.languages.split(',').map(x=>x.trim()),bring_notes:v.bring_notes||null,approval_mode:v.approval_mode,registration_status:'open',status:'published',is_example:false}).select('id').single();if(error){setSaveError(error.message);return}setDone(event.id)}if(done)return <div className="success">
<h1>Your activity is published</h1>
<p>It is now visible in Discover and a confirmation was added to Notifications.</p>
<div className="actions">
<button className="button" onClick={()=>navigate(`/events/${done}`)}>View event</button>
<button className="button secondary" onClick={()=>navigate('/discover')}>Open Discover</button>
</div>
</div>;return <div className="form-page">
<span className="eyebrow">Host a playdate</span>
<h1>Create a simple local plan</h1>
<p>Public venues only. Guardians are always required.</p>
<form noValidate onSubmit={handleSubmit(save)}>
<div className="form-grid">
<label>Title<input aria-invalid={Boolean(errors.title)} {...register('title')} placeholder="Saturday park explorers"/>
<Err name="title"/>
</label>
<label>Activity category<select aria-invalid={Boolean(errors.category)} {...register('category')}>
<option value="">Choose</option>{categories.map(x=>
<option key={x}>{x}</option>)}</select>
<Err name="category"/>
</label>
<label className="wide">Description<textarea aria-invalid={Boolean(errors.description)} {...register('description')} placeholder="What will families do?"/>
<Err name="description"/>
</label>
<label>Locality<select aria-invalid={Boolean(errors.locality_id)} {...register('locality_id')}>
<option value="">Choose</option>{localities.map(l=>
<option value={l.id} key={l.id}>{l.name}</option>)}</select>
<Err name="locality_id"/>
</label>
<label className="wide">Public venue address<input aria-invalid={Boolean(errors.address_text)} {...register('address_text')} placeholder="Venue or park, street and city"/>
<span>No floor, apartment, home address or door code.</span>
<Err name="address_text"/>
</label>
<label>Start date<input type="date" aria-invalid={Boolean(errors.start_date)} {...register('start_date')}/>
<Err name="start_date"/>
</label>
<label>Start time<input type="time" aria-invalid={Boolean(errors.start_time)} {...register('start_time')}/>
<Err name="start_time"/>
</label>
<label>End date<input type="date" min={startDate} aria-invalid={Boolean(errors.end_date)} {...register('end_date')}/>
<Err name="end_date"/>
</label>
<label>End time<input type="time" aria-invalid={Boolean(errors.end_time)} {...register('end_time')}/>
<Err name="end_time"/>
</label>
<fieldset className="wide age-dropdown-field"><legend>Age bands</legend><details className="checkbox-dropdown"><summary aria-invalid={Boolean(errors.age_bands)}>{watch('age_bands')?.length?watch('age_bands').map(x=>`${x} years`).join(', '):'Choose age bands'}</summary><div className="checkbox-menu">{ages.map(x=><label key={x}><input type="checkbox" value={x} {...register('age_bands')}/><span>{x} years</span></label>)}</div></details><span className="field-hint">Select one or more.</span><Err name="age_bands"/></fieldset>
<label className="number-field">Maximum children<input type="number" min="1" max="20" aria-invalid={Boolean(errors.max_children)} {...register('max_children')}/>
<Err name="max_children"/>
</label>
<label className="number-field">Maximum adults<input type="number" min="1" max="40" aria-invalid={Boolean(errors.max_adults)} {...register('max_adults')}/>
<Err name="max_adults"/>
</label>
<label>Setting<select {...register('environment')}>
<option value="outdoor">Outdoor</option>
<option value="indoor">Indoor</option>
<option value="both">Both</option>
</select>
</label>
<label>Languages<input aria-invalid={Boolean(errors.languages)} {...register('languages')} placeholder="Svenska, English"/>
<Err name="languages"/>
</label>
<label>Approval mode<select {...register('approval_mode')}>
<option value="manual">Manual approval</option>
<option value="automatic">Automatic until full</option>
</select>
</label>
<label className="wide">What to bring<textarea aria-invalid={Boolean(errors.bring_notes)} {...register('bring_notes')}/>
<Err name="bring_notes"/>
</label>
</div>{saveError&&<p className="notice" role="alert">Could not publish the event: {saveError}</p>}<div className="fixed-rule">
<b>Guardian attendance required</b>
<span>Every guardian remains responsible for their own children.</span>
</div>
<button className="button" disabled={isSubmitting}>{isSubmitting?'Publishing…':'Publish activity'}</button>
</form>
</div>}
