const MPrivledges = require('../models/privileges');

const readAll = async (req, res, next) => {
  let privilegesFilter = {
    owner_FK: req.userID,
    user: req.user || '%',
    privCat_FK: req?.privCat || '%',
  }
  if(req.portfolios){
    privilegesFilter['portfolios'] = req.portfolios;
  }
  if(req.projects){
    privilegesFilter['projects'] = req.projects;
  }
  if(req.tasks){
    privilegesFilter['tasks'] = req.tasks;
  }
  const rulesResp = await MPrivledges.read(privilegesFilter);

  if (rulesResp.err) {
    return next('err while reading all rules');
  }

  return res.json({ data: rulesResp[0] });
};

const create = async (req, res, next) => {
  const {
    portfolio,
    project,
    assignee,
    title,
    description,
    bgColor,
    status,
    dueDate,
  } = req.body;
  const rulesResp = await MPrivledges.create({
    ownerID: req.userID,
    portfolio,
    project,
    assignee,
    title,
    description,
    bgColor,
    status,
    dueDate,
  });

  if (rulesResp.err) {
    return next('err while creating a rule');
  }

  if (!rulesResp[0].affectedRows) {
    return next('err while creating a rule, zero affected rows');
  }

  return res.json({ data: 'rule created successfully' });
};

const update = async (req, res, next) => {
  const newData = req.body;
  // console.log(newData)
  const editableFiels = ['title', 'description', 'bgColor', 'dueDate'];
  const query = [
    {
      ownerID: req.userID,
      id: newData.id,
    },
    {},
  ];
  Object.keys(newData).forEach((fieldKey) => {
    if (editableFiels.includes(fieldKey)) {
      if (fieldKey == 'dueDate' && newData[fieldKey] == '') return;
      query[1][fieldKey] = newData[fieldKey];
    }
  });
  // console.log(query)

  if (Object.keys(query[1]).length) {
    const rulesResp = await MPrivledges.update(...query);

    // console.log(query)

    if (rulesResp.err) {
      return next('err while updating a rule');
    }

    if (!rulesResp[0].affectedRows) {
      return next('err while updating a rule, zero affected rows');
    }

    return res.json({ data: 'rule updated successfully' });
  }

  return res.json({ data: 'there is nothing to update' });
};

const remove = async (req, res, next) => {
  const { id } = req.body;
  const rulesResp = await MPrivledges.remove({ ownerID: req.userID, id });

  if (rulesResp.err) {
    return next('err while removing a rule');
  }

  return res.json({ data: 'rule removed successfully' });
};

module.exports = { readAll, create, update, remove };
