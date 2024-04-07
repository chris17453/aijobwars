


run:
	@python -m dpss.server

update_file_list:
	@scripts/update_files.sh

update: update_file_list	
	@rsync -avz --files-from=files.txt . root@10.90.0.45:/web/aijobwars.com/


bundle:
	@scripts/bundle.sh

intro_scene:
	@scripts/scene.sh |jq '. | sort_by(.slide)'>html/static/storyboard/intro/intro_scene.json