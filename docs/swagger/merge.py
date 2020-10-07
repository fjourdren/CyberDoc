import yaml

YAML_FILES = ["files.yml", "users.yml"]

# First file
with open(YAML_FILES[0]) as firstYAMLFile:
  merged_swagger = yaml.load(firstYAMLFile, Loader=yaml.FullLoader)
  merged_swagger["info"]["title"] = "CyberDoc API"

for yaml_file in YAML_FILES[1:]:
    with open(yaml_file) as file:
        content = yaml.load(file, Loader=yaml.FullLoader)
        for key in content["paths"].keys():
          merged_swagger["paths"][key] = content["paths"][key]
        for key in content["components"]["schemas"].keys():
          merged_swagger["components"]["schemas"][key] = content["components"]["schemas"][key]

with open("swagger.yml", "w") as output:
    output.write(yaml.dump(merged_swagger, Dumper=yaml.Dumper))
