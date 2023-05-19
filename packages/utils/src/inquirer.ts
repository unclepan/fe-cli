import inquirer, { Answers } from 'inquirer';

async function inquirerFun({ 
  choices, 
  defaultValue, 
  message, 
  type = 'list', 
  require = true, 
  mask = '*',
  validate,
  pageSize,
  loop
}: Answers) {
  const options: Answers = {
    type,
    name: 'name',
    message,
    default: defaultValue,
    require,
    mask,
    validate,
    pageSize,
    loop
  }
  // 选择项
  if (type === 'list') {
    options.choices = choices;
  }
  const answer = await inquirer.prompt(options);
  return answer.name;
}

export default inquirerFun