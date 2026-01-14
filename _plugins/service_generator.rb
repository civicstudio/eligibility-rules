require 'yaml'

module Jekyll
  class ServicePageGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Find all service YAML files in data/jurisdictions
      service_files = Dir.glob(File.join(site.source, 'data', 'jurisdictions', '**', 'services', '*.yaml'))

      # Collect all services for the index
      all_services = []

      service_files.each do |file|
        # Use safe_load with permitted_classes to allow Date objects
        data = YAML.safe_load(File.read(file), permitted_classes: [Date, Time, DateTime])
        next unless data && data['id']

        # Determine jurisdiction path from file location
        relative_path = file.sub(File.join(site.source, 'data', 'jurisdictions', ''), '')
        jurisdiction_parts = relative_path.split(File::SEPARATOR)
        jurisdiction_parts.pop # remove filename
        jurisdiction_parts.pop # remove 'services'

        # Build jurisdiction info
        jurisdiction_path = jurisdiction_parts.join('/')
        jurisdiction_name = build_jurisdiction_name(site, jurisdiction_parts)
        jurisdiction_url = "/jurisdictions/#{jurisdiction_path}/"

        # Create the page
        page = ServicePage.new(site, site.source, data, file, jurisdiction_name, jurisdiction_url)
        site.pages << page

        # Add to services index
        all_services << {
          'id' => data['id'],
          'name' => data['name'],
          'alternate_names' => data['alternate_names'],
          'description' => data['description'],
          'jurisdiction' => jurisdiction_name,
          'jurisdiction_url' => jurisdiction_url,
          'category' => data['category'],
          'service_type' => data['service_type'],
          'url' => "/services/#{data['id']}/"
        }
      end

      # Sort services by name and store in site.data for use in templates
      site.data['services'] = all_services.sort_by { |s| s['name'].downcase }
    end

    def build_jurisdiction_name(site, parts)
      # Load jurisdiction metadata if available
      jurisdiction_file = File.join(site.source, 'data', 'jurisdictions', *parts, '_jurisdiction.yaml')
      if File.exist?(jurisdiction_file)
        jurisdiction_data = YAML.safe_load(File.read(jurisdiction_file), permitted_classes: [Date, Time, DateTime])
        return jurisdiction_data['name'] if jurisdiction_data && jurisdiction_data['name']
      end

      # Fallback to humanizing the last part
      parts.last.split('-').map(&:capitalize).join(' ')
    end
  end

  class ServicePage < Page
    # Deterministic key order for YAML attributes
    ATTRIBUTE_ORDER = %w[
      id
      name
      alternate_names
      jurisdiction_id
      agency_id
      service_type
      category
      description
      application_url
      source_urls
      last_verified
      ruleset
    ].freeze

    def initialize(site, base, data, data_path, jurisdiction_name, jurisdiction_url)
      @site = site
      @base = base
      @dir = "services/#{data['id']}"
      @name = 'index.html'

      self.process(@name)

      # Initialize data hash and set layout
      self.data = {}
      self.data['layout'] = 'service'
      self.content = ''

      # Set page data from YAML
      self.data['title'] = data['name']
      self.data['service_id'] = data['id']
      self.data['alternate_names'] = data['alternate_names']
      self.data['service_type'] = data['service_type']
      self.data['category'] = data['category']
      self.data['description'] = data['description']
      self.data['agency'] = data['agency_id']&.split('-')&.map(&:upcase)&.join('-') || 'Unknown'
      self.data['application_url'] = data['application_url']
      self.data['source_urls'] = data['source_urls']
      self.data['last_verified'] = data['last_verified']
      self.data['ruleset'] = data['ruleset']
      self.data['jurisdiction'] = jurisdiction_name
      self.data['jurisdiction_url'] = jurisdiction_url
      self.data['data_path'] = data_path.sub(site.source + '/', '')
    end

    def order_attributes(data)
      ordered = {}
      ATTRIBUTE_ORDER.each do |key|
        ordered[key] = data[key] if data.key?(key)
      end
      # Add any remaining keys not in the order list
      data.each do |key, value|
        ordered[key] = value unless ordered.key?(key)
      end
      ordered
    end
  end
end
