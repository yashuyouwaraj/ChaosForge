const projectService = require("./project.service");
const {generateTraffic} = require("../../services/traffic.service")

const createProject = (req, res) => {
  const { name } = req.body;

  const project = projectService.create(name, req.user.email);

  return res.json(project);
};

const getProjects = (req, res) => {
  const projects = projectService.getAll(req.user.email);

  return res.json(projects);
};

const getProject = (req, res) => {
  const project = projectService.getOne(req.params.id);

  return res.json(project);
};


const runProjectTraffic = async(req,res)=>{
  const {id} = req.params;
  const count = req.query.count || 10;

  const project = projectService.getOne(id)

  if(!project) return res.status(404).json({message:"Project not found"})

   // 🔐 IMPORTANT: Ownership check
   if(project.owner !==req.user.email){
    return res.status(403).json({message:"Not your project"})
   }

   await generateTraffic(count, id, req.requestId)

  return res.json({message: `Traffic started for project ${id}`})
}



module.exports = { createProject, getProjects, getProject, runProjectTraffic };
