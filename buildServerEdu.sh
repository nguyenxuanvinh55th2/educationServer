cd ~/education/educationServer/
meteor build --directory ../build
rsync -av -e "ssh -p 22" ../build/bundle root@13.228.29.146:/opt/elearning
